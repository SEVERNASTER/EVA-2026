"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  lookupCertificateAdmin,
  type CertificateLookupResult,
} from "@/app/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  certificatePath,
  formatIssuedDate,
} from "@/lib/certificates/types";

export function AdminVerifyCertificate({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode);

  async function action(
    _prev: CertificateLookupResult | null,
    formData: FormData,
  ): Promise<CertificateLookupResult> {
    return lookupCertificateAdmin(String(formData.get("code") ?? "").trim());
  }

  const [state, formAction, pending] = useActionState(action, null);
  const issued =
    state?.ok &&
    (state.certificate.is_validated === true ||
      state.certificate.status === "APPROVED");

  return (
    <div className="mt-6 max-w-3xl">
      <form
        action={formAction}
        className="rounded-[1.4rem] border border-border bg-card p-6 shadow-sm"
      >
        <label htmlFor="code" className="block text-sm font-semibold text-foreground">
          Código de verificación
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          8 caracteres del diploma (ej: 8F72A91C). Solo consulta autenticidad.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={8}
              placeholder="Ej: 8F72A91C"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              className="auth-field h-11 w-full rounded-2xl border border-border bg-background px-4 font-mono text-base font-bold uppercase tracking-widest text-foreground placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !code.trim()}
            className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
          >
            <Icon name="search" size={18} />
            {pending ? "Consultando…" : "Consultar"}
          </button>
        </div>
      </form>

      {state ? (
        <div className="mt-6">
          {state.ok && issued ? (
            <div className="rounded-[1.4rem] border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <Icon name="check" size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Certificado emitido
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      El código coincide con un diploma oficial de EVA
                    </p>
                  </div>
                </div>
                <Badge tone="success">Válido</Badge>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <LookupField label="Participante" value={state.certificate.participant_name} />
                <LookupField
                  label="Curso aprobado"
                  value={state.certificate.course_name}
                  accent
                />
                <LookupField
                  label="Duración"
                  value={`${state.certificate.hours} horas académicas`}
                />
                <LookupField
                  label="Docente"
                  value={state.certificate.instructor_name || "Docente titular"}
                />
                <LookupField
                  label="Fecha de emisión"
                  value={formatIssuedDate(state.certificate.issued_at)}
                />
                <LookupField
                  label="Código"
                  value={state.certificate.code}
                  mono
                />
              </dl>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={certificatePath(state.certificate.code)}
                  target="_blank"
                  className="auth-submit inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs"
                >
                  <Icon name="visibility" size={16} />
                  Ver certificado
                </Link>
                <a
                  href={`${certificatePath(state.certificate.code)}/pdf`}
                  download
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Icon name="download" size={16} />
                  Descargar PDF
                </a>
              </div>
            </div>
          ) : state.ok ? (
            <div className="rounded-[1.4rem] border border-amber-500/30 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-200">
                  <Icon name="pending" size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Código aún no oficial
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Existe un registro para {state.certificate.code}, pero administración
                    todavía no lo emitió. Emite desde Inscripciones.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <Icon name="close" size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-destructive">
                    Certificado no encontrado
                  </h2>
                  <p className="text-xs text-destructive/80">{state.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function LookupField({
  label,
  value,
  accent = false,
  mono = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono text-base font-extrabold tracking-widest text-foreground"
            : accent
              ? "mt-1 text-base font-semibold text-primary"
              : "mt-1 text-base font-semibold text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
