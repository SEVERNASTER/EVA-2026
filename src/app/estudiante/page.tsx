import { StudentCourseList } from "@/components/student-course-list";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import type { Enrollment } from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";
import type {
  AttendanceRow,
  CourseProgress,
  Grade,
  Session,
} from "@/lib/teaching/types";

export default async function StudentPage() {
  const profile = await requireRole("estudiante");
  const supabase = await createClient();
  const [{ data: courses }, { data: enrollmentData }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, instructor:profiles!instructor_id(full_name), course_schedule_slots(*)")
      .eq("published", true)
      .order("name"),
    supabase.from("enrollments").select("*").eq("student_id", profile.id),
  ]);

  const enrollments = (enrollmentData ?? []) as Enrollment[];
  const enrolled = enrollments.filter((row) => row.status === "inscrito");
  const enrolledIds = enrolled.map((row) => row.id);
  const enrolledCourseIds = enrolled.map((row) => row.course_id);

  const [{ data: sessionData }, { data: attendanceData }, { data: gradeData }] =
    enrolled.length
      ? await Promise.all([
          supabase
            .from("sessions")
            .select("id, course_id")
            .in("course_id", enrolledCourseIds),
          supabase
            .from("attendance")
            .select("session_id, enrollment_id, present")
            .in("enrollment_id", enrolledIds),
          supabase
            .from("grades")
            .select("enrollment_id, score")
            .in("enrollment_id", enrolledIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const sessions = (sessionData ?? []) as Pick<Session, "id" | "course_id">[];
  const attendance = (attendanceData ?? []) as AttendanceRow[];
  const grades = (gradeData ?? []) as Pick<Grade, "enrollment_id" | "score">[];

  const progress: Record<string, CourseProgress> = {};
  for (const enrollment of enrolled) {
    const grade = grades.find((row) => row.enrollment_id === enrollment.id);
    progress[enrollment.course_id] = {
      total: sessions.filter((row) => row.course_id === enrollment.course_id)
        .length,
      present: attendance.filter(
        (row) => row.enrollment_id === enrollment.id && row.present,
      ).length,
      score: grade ? Number(grade.score) : null,
    };
  }

  return (
    <StudentCourseList
        courses={(courses ?? []) as Course[]}
        enrollments={enrollments}
        progress={progress}
      />
  );
}
