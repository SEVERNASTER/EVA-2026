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
 * Permite al administrador validar formalmente un código de certificado y marcarlo como aprobado.
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

  const supabase = await createClient();
  const validatedAt = new Date().toISOString();

  // Actualiza en base de datos el estado de validación y auditoría
  const { error: updateError } = await supabase
    .from("certificates")
    .update({
      is_validated: true,
      status: "APPROVED",
      validated_at: validatedAt,
      validated_by: admin.id,
    })
    .eq("code", code);

  if (updateError) {
    // Si la actualización por supabase client falla por RLS o función, intentamos rpc
    await supabase.rpc("approve_certificate", { p_code: code });
  }

  revalidatePath("/estudiante");
  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/verificar");
  revalidatePath(`/certificado/${code}`);

  return {
    ok: true,
    certificate: {
      ...certificate,
      is_validated: true,
      status: "APPROVED",
      validated_at: validatedAt,
    },
    validatedAt,
    validatedBy: admin.full_name,
  };
}

/**
 * Permite al administrador aprobar directamente un certificado desde el panel de inscripciones.
 */
export async function approveCertificateByEnrollment(
  enrollmentId: string,
): Promise<{ error: string } | { ok: true }> {
  const admin = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("certificates")
    .update({
      is_validated: true,
      status: "APPROVED",
      validated_at: new Date().toISOString(),
      validated_by: admin.id,
    })
    .eq("enrollment_id", enrollmentId);

  if (error) {
    return { error: "No se pudo validar el certificado." };
  }

  revalidatePath("/estudiante");
  revalidatePath("/admin/inscripciones");
  return { ok: true };
}
