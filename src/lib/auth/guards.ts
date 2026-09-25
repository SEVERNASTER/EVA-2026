import { redirect } from "next/navigation";
import { getSessionProfile, type Profile } from "@/lib/auth/profile";
import { panelPath, type UserRole } from "@/lib/auth/roles";

export async function requireProfile(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireRole(role: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== role) {
    redirect(panelPath(profile.role));
  }
  return profile;
}
