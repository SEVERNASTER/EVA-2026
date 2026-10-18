import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("estudiante");
  return (
    <AppShell role="estudiante" name={profile.full_name}>
      {children}
    </AppShell>
  );
}
