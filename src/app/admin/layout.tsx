import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");
  return (
    <AppShell role="admin" name={profile.full_name}>
      {children}
    </AppShell>
  );
}
