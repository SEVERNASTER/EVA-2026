"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUserRole, panelPath, type UserRole } from "@/lib/auth/roles";

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) {
    return "Correo o contraseña incorrectos.";
  }
  if (lower.includes("already registered")) {
    return "Ese correo ya tiene una cuenta. Inicia sesión.";
  }
  if (lower.includes("password")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return "No se pudo completar la operación. Prueba de nuevo.";
}

async function roleForUser(userId: string): Promise<UserRole> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (data && isUserRole(data.role)) {
    return data.role;
  }

  return "estudiante";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completá correo y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: mapAuthError(error?.message ?? "") };
  }

  redirect(panelPath(await roleForUser(data.user.id)));
}

export async function signUp(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { error: "Completá nombre, correo y contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error || !data.user) {
    return { error: mapAuthError(error?.message ?? "") };
  }

  redirect(panelPath("estudiante"));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
