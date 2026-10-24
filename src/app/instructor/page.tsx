import { CourseCatalog } from "@/components/course-catalog";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorPage() {
  const profile = await requireRole("instructor");
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name), course_schedule_slots(*)")
    .eq("instructor_id", profile.id)
    .order("name");

  return (
    <CourseCatalog
        title="Tus cursos"
        description="Registra las sesiones, la asistencia de cada participante y su nota final."
        empty="No tienes cursos asignados."
        courses={(data ?? []) as Course[]}
        manageHref="/instructor/cursos"
      />
  );
}
