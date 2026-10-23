"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function revalidateCoursePaths(courseId: string) {
  revalidatePath(`/instructor/cursos/${courseId}`);
  revalidatePath(`/instructor/cursos/${courseId}`, "page");
  revalidatePath("/instructor");
  revalidatePath("/instructor", "page");
  revalidatePath("/estudiante");
  revalidatePath("/estudiante", "page");
}

export async function createSession(
  courseId: string,
  formData: FormData,
): Promise<Result> {
  await requireRole("instructor");
  const sessionDate = String(formData.get("session_date") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();

  if (!DATE_PATTERN.test(sessionDate)) {
    return { error: "Elige la fecha de la sesión." };
  }
  if (!topic) {
    return { error: "Escribe el tema de la sesión." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sessions")
    .insert({ course_id: courseId, session_date: sessionDate, topic });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una sesión en esa fecha." };
    }
    return { error: "No se pudo crear la sesión." };
  }

  revalidateCoursePaths(courseId);
  return { ok: true };
}

export async function deleteSession(
  courseId: string,
  sessionId: string,
): Promise<Result> {
  await requireRole("instructor");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId)
    .eq("course_id", courseId)
    .select("id");

  if (error || !data?.length) {
    return { error: "No se pudo eliminar la sesión." };
  }

  revalidateCoursePaths(courseId);
  return { ok: true };
}

export async function saveAttendance(
  courseId: string,
  sessionId: string,
  formData: FormData,
): Promise<Result> {
  await requireRole("instructor");
  const supabase = await createClient();

  const [{ data: session }, { data: enrollments, error: loadError }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("status", "inscrito"),
    ]);

  if (!session) {
    return { error: "La sesión no pertenece a este curso." };
  }
  if (loadError) {
    return { error: "No se pudo cargar la lista de inscritos." };
  }
  if (!enrollments?.length) {
    return { error: "El curso no tiene participantes inscritos." };
  }

  const rows = enrollments.map((enrollment) => {
    const rawValues = formData.getAll(`present_${enrollment.id}`);
    const isPresent = rawValues.some((v) => v === "on" || v === "true");
    return {
      session_id: sessionId,
      enrollment_id: enrollment.id,
      present: isPresent,
    };
  });

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "session_id,enrollment_id" });

  if (error) {
    return { error: "No se pudo guardar la asistencia." };
  }

  revalidateCoursePaths(courseId);
  return { ok: true };
}

export async function saveGrade(
  courseId: string,
  enrollmentId: string,
  formData: FormData,
): Promise<Result> {
  const profile = await requireRole("instructor");
  const raw = String(formData.get("score") ?? "").trim().replace(",", ".");
  const score = Number(raw);

  if (!raw || !Number.isFinite(score) || score < 0 || score > 100) {
    return { error: "La nota debe estar entre 0 y 100." };
  }

  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("id", enrollmentId)
    .eq("course_id", courseId)
    .eq("status", "inscrito")
    .maybeSingle();

  if (!enrollment) {
    return { error: "El participante no está inscrito en este curso." };
  }

  const { error } = await supabase.from("grades").upsert(
    {
      enrollment_id: enrollmentId,
      score: Math.round(score * 100) / 100,
      graded_by: profile.id,
    },
    { onConflict: "enrollment_id" },
  );

  if (error) {
    return { error: "No se pudo guardar la nota." };
  }

  revalidateCoursePaths(courseId);
  return { ok: true };
}