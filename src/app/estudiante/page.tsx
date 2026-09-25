import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CoursesPlaceholder } from "@/components/courses-placeholder";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function StudentPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell role="estudiante" name={profile.full_name}>
      <CoursesPlaceholder
        title="Oferta de cursos"
        body="Cuando un curso esté publicado, aparecerá en este listado."
      />
    </AppShell>
  );
}
