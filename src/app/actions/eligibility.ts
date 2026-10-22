"use server";

import { requireProfile } from "@/lib/auth/guards";
import {
  computeAttendancePercent,
  evaluateEligibility,
  type EligibilityResponse,
  type EligibilityResult,
} from "@/lib/eligibility/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Check eligibility for a single enrollment.
 *
 * Accessible by:
 *  - The enrolled student themselves.
 *  - An admin (can check any enrollment).
 *
 * Returns the eligibility result with all criteria details, or an error.
 */
export async function checkEligibility(
  enrollmentId: string,
): Promise<EligibilityResponse> {
  const profile = await requireProfile();
  const supabase = await createClient();

  // 1. Load enrollment
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, course_id, student_id, status")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    return { error: "No se encontró la inscripción." };
  }

  if (enrollment.status !== "inscrito") {
    return { error: "El participante aún no está inscrito (pendiente de pago)." };
  }

  // Authorization: only the student themselves or an admin
  if (profile.role !== "admin" && enrollment.student_id !== profile.id) {
    return { error: "No tienes permiso para consultar esta elegibilidad." };
  }

  // 2. Load course, student name, sessions, attendance, and grade in parallel
  const [
    { data: course },
    { data: student },
    { data: sessionData },
    { data: attendanceData },
    { data: gradeData },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, nota_minima, asistencia_minima")
      .eq("id", enrollment.course_id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", enrollment.student_id)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("id")
      .eq("course_id", enrollment.course_id),
    supabase
      .from("attendance")
      .select("session_id, present")
      .eq("enrollment_id", enrollmentId),
    supabase
      .from("grades")
      .select("score")
      .eq("enrollment_id", enrollmentId)
      .maybeSingle(),
  ]);

  if (!course) {
    return { error: "No se encontró el curso asociado." };
  }

  const studentName = student?.full_name ?? "Participante";
  const sessionsTotal = (sessionData ?? []).length;
  const sessionsPresent = (attendanceData ?? []).filter(
    (row) => row.present,
  ).length;
  const score = gradeData ? Number(gradeData.score) : null;

  // 3. Evaluate
  const attendancePercent = computeAttendancePercent(
    sessionsPresent,
    sessionsTotal,
  );

  const result = evaluateEligibility(
    enrollmentId,
    studentName,
    course.name,
    {
      notaMinima: Number(course.nota_minima),
      asistenciaMinima: Number(course.asistencia_minima),
    },
    { score, attendancePercent, sessionsPresent, sessionsTotal },
  );

  return { data: result };
}

/**
 * Check eligibility for ALL enrolled participants in a course.
 *
 * Only accessible by admins.
 *
 * Returns an array of eligibility results, or an error.
 */
export async function checkCourseEligibility(
  courseId: string,
): Promise<{ data: EligibilityResult[] } | { error: string }> {
  const profile = await requireProfile();

  if (profile.role !== "admin") {
    return { error: "Solo un administrador puede consultar la elegibilidad del curso completo." };
  }

  const supabase = await createClient();

  // 1. Load the course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name, nota_minima, asistencia_minima")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError || !course) {
    return { error: "No se encontró el curso." };
  }

  // 2. Load enrolled participants
  const { data: enrollmentData, error: enrollError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .eq("course_id", courseId)
    .eq("status", "inscrito");

  if (enrollError) {
    return { error: "No se pudieron cargar los participantes." };
  }

  const enrollments = enrollmentData ?? [];

  if (enrollments.length === 0) {
    return { data: [] };
  }

  const enrollmentIds = enrollments.map((e) => e.id);
  const studentIds = enrollments.map((e) => e.student_id);

  // 3. Load student names, sessions, attendance, and grades in parallel
  const [
    { data: profileData },
    { data: sessionData },
    { data: attendanceData },
    { data: gradeData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds),
    supabase.from("sessions").select("id").eq("course_id", courseId),
    supabase
      .from("attendance")
      .select("session_id, enrollment_id, present")
      .in("enrollment_id", enrollmentIds),
    supabase
      .from("grades")
      .select("enrollment_id, score")
      .in("enrollment_id", enrollmentIds),
  ]);

  const sessionsTotal = (sessionData ?? []).length;
  const attendance = attendanceData ?? [];
  const grades = new Map(
    (gradeData ?? []).map((g) => [g.enrollment_id, Number(g.score)]),
  );
  const names = new Map(
    (profileData ?? []).map((p) => [p.id, p.full_name as string]),
  );

  // 4. Evaluate each enrollment
  const criteria = {
    notaMinima: Number(course.nota_minima),
    asistenciaMinima: Number(course.asistencia_minima),
  };

  const results = enrollments.map((enrollment) => {
    const studentName = names.get(enrollment.student_id) ?? "Participante";
    const sessionsPresent = attendance.filter(
      (row) => row.enrollment_id === enrollment.id && row.present,
    ).length;
    const score = grades.get(enrollment.id) ?? null;
    const attendancePercent = computeAttendancePercent(
      sessionsPresent,
      sessionsTotal,
    );

    return evaluateEligibility(
      enrollment.id,
      studentName,
      course.name,
      criteria,
      { score, attendancePercent, sessionsPresent, sessionsTotal },
    );
  });

  return { data: results };
}


