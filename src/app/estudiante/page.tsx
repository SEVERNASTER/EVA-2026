import {
  StudentCourseList,
  type CourseOutcome,
} from "@/components/student-course-list";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { evaluateEligibility } from "@/lib/eligibility";
import type { Enrollment } from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";
import {
  embeddedOne,
  embeddedPresent,
  embeddedScore,
  ENROLLMENT_TEACHING_SELECT,
  type CourseProgress,
  type EnrollmentTeachingEmbed,
} from "@/lib/teaching/types";

type CourseWithSessions = Course & { sessions?: { count: number }[] };
type StudentEnrollment = Enrollment &
  EnrollmentTeachingEmbed & {
    certificates?: { code: string } | { code: string }[] | null;
  };

export default async function StudentPage() {
  const profile = await requireRole("estudiante");
  const supabase = await createClient();
  // Una sola tanda: el conteo de sesiones va en cursos y la asistencia, nota y
  // certificado van embebidos en cada inscripción.
  const [{ data: courseData }, { data: enrollmentData }] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "*, instructor:profiles!instructor_id(full_name), course_schedule_slots(*), sessions(count)",
      )
      .eq("published", true)
      .order("name"),
    supabase
      .from("enrollments")
      .select(`*, ${ENROLLMENT_TEACHING_SELECT}, certificates(code)`)
      .eq("student_id", profile.id),
  ]);

  const courses = (courseData ?? []) as CourseWithSessions[];
  const enrollments = (enrollmentData ?? []) as StudentEnrollment[];
  const courseById = new Map(courses.map((course) => [course.id, course]));

  const progress: Record<string, CourseProgress> = {};
  const outcomes: Record<string, CourseOutcome> = {};
  for (const enrollment of enrollments) {
    if (enrollment.status !== "inscrito") continue;
    const course = courseById.get(enrollment.course_id);
    progress[enrollment.course_id] = {
      total: course?.sessions?.[0]?.count ?? 0,
      present: embeddedPresent(enrollment),
      score: embeddedScore(enrollment),
    };
    if (course) {
      outcomes[enrollment.course_id] = {
        enrollmentId: enrollment.id,
        eligibility: evaluateEligibility(progress[enrollment.course_id], course),
        certificateCode: embeddedOne(enrollment.certificates)?.code ?? null,
      };
    }
  }

  return (
    <StudentCourseList
      courses={courses}
      enrollments={enrollments}
      progress={progress}
      outcomes={outcomes}
    />
  );
}
