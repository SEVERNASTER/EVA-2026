import { AppShell } from "@/components/app-shell";
import { StudentCourseList } from "@/components/student-course-list";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import type { Enrollment } from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";

export default async function StudentPage() {
  const profile = await requireRole("estudiante");
  const supabase = await createClient();
  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, instructor:profiles!instructor_id(full_name)")
      .eq("published", true)
      .order("name"),
    supabase.from("enrollments").select("*").eq("student_id", profile.id),
  ]);

  return (
    <AppShell role="estudiante" name={profile.full_name}>
      <StudentCourseList
        courses={(courses ?? []) as Course[]}
        enrollments={(enrollments ?? []) as Enrollment[]}
      />
    </AppShell>
  );
}
