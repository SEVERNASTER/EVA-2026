import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import {
  normalizeCertificateCode,
  type PublicCertificate,
} from "@/lib/certificates/types";
import { getPublicSupabaseEnv } from "@/lib/env";

/** Verificación sin sesión: la RPC solo devuelve el certificado del código exacto. */
export const getPublicCertificate = cache(
  async (rawCode: string): Promise<PublicCertificate | null> => {
    const code = normalizeCertificateCode(rawCode);
    if (!code) {
      return null;
    }

    const { url, anonKey } = getPublicSupabaseEnv();
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await supabase
      .rpc("certificate_by_code", { p_code: code })
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as PublicCertificate;
  },
);
