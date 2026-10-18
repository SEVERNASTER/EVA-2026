import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("instructor");
  return (
    <AppShell role="instructor" name={profile.full_name}>
      {children}
    </AppShell>
  );
}
