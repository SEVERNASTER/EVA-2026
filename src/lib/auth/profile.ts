import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isUserRole, type UserRole } from "@/lib/auth/roles";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};

/** Una sola consulta por request aunque layout, página y acción la pidan. */
export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !isUserRole(data.role)) {
    return null;
  }

  return data as Profile;
});
