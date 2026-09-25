import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CoursesPlaceholder } from "@/components/courses-placeholder";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function InstructorPage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell role="instructor" name={profile.full_name}>
      <CoursesPlaceholder
        title="Tus cursos"
        body="Aquí vas a ver los cursos que dictas. Por ahora el panel confirma tu acceso como instructor."
      />
    </AppShell>
  );
}
