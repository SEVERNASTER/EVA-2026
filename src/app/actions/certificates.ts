"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { getPublicCertificate } from "@/lib/certificates/public";
import {
  normalizeCertificateCode,
  type PublicCertificate,
} from "@/lib/certificates/types";
import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true; code: string };

export async function issueCertificate(enrollmentId: string): Promise<Result> {
  await requireRole("admin");
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
  revalidatePath(`/certificado/${data}`);
  return { ok: true, code: data };
}

export type CertificateLookupResult =
  | { ok: true; certificate: PublicCertificate }
  | { ok: false; error: string };

/** Consulta un código. No emite ni cambia el estado del certificado. */
export async function lookupCertificateAdmin(
  rawCode: string,
): Promise<CertificateLookupResult> {
  await requireRole("admin");
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

  return { ok: true, certificate };
}
