import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CoursesPlaceholder } from "@/components/courses-placeholder";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function AdminPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell role="admin" name={profile.full_name}>
      <CoursesPlaceholder
        title="Cursos"
        body="Publica y administra la oferta de formación continua. El alta de cursos entra en el siguiente incremento."
      />
    </AppShell>
  );
}
