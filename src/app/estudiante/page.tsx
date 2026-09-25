import { AppShell } from "@/components/app-shell";
import { CourseCatalog } from "@/components/course-catalog";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function StudentPage() {
  const profile = await requireRole("estudiante");
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name)")
    .eq("published", true)
    .order("name");

  return (
    <AppShell role="estudiante" name={profile.full_name}>
      <CourseCatalog
        title="Oferta de cursos"
        empty="No hay cursos publicados."
        courses={(data ?? []) as Course[]}
      />
    </AppShell>
  );
}
