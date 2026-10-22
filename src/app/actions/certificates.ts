"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true; code: string };

export async function issueCertificate(enrollmentId: string): Promise<Result> {
  const profile = await requireProfile();
  if (profile.role !== "admin" && profile.role !== "estudiante") {
    return { error: "Solo el titular o el admin emiten el certificado." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("issue_certificate", {
    p_enrollment_id: enrollmentId,
  });

  if (error || typeof data !== "string") {
    return {
      error:
        error?.code === "P0001"
          ? error.message
          : "No se pudo emitir el certificado.",
    };
  }

  revalidatePath("/estudiante");
  revalidatePath("/admin/inscripciones");
  return { ok: true, code: data };
}
