import { AppShell } from "@/components/app-shell";
import { CourseCatalog } from "@/components/course-catalog";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorPage() {
  const profile = await requireRole("instructor");
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name)")
    .eq("instructor_id", profile.id)
    .order("name");

  return (
    <AppShell role="instructor" name={profile.full_name}>
      <CourseCatalog
        title="Tus cursos"
        empty="No tienes cursos asignados."
        courses={(data ?? []) as Course[]}
      />
    </AppShell>
  );
}
