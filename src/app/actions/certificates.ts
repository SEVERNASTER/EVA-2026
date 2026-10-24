"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, requireRole } from "@/lib/auth/guards";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  normalizeCertificateCode,
  type PublicCertificate,
} from "@/lib/certificates/types";
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

export type AdminValidationResult =
  | { ok: true; certificate: PublicCertificate; validatedAt: string; validatedBy: string }
  | { ok: false; error: string };

/**
 * Permite al administrador validar formalmente un código de certificado.
 */
export async function validateCertificateAdmin(
  rawCode: string,
): Promise<AdminValidationResult> {
  const admin = await requireRole("admin");
  const code = normalizeCertificateCode(rawCode);

  if (!code) {
    return {
      ok: false,
      error: "El código debe ser de 8 caracteres alfanuméricos (ej: 8F72A91C).",
    };
  }

  const certificate = await getPublicCertificate(code);

  if (!certificate) {
    return {
      ok: false,
      error: `No existe ningún certificado registrado con el código ${code}.`,
    };
  }

  return {
    ok: true,
    certificate,
    validatedAt: new Date().toISOString(),
    validatedBy: admin.full_name,
  };
}
