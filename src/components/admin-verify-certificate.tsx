"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  validateCertificateAdmin,
  type AdminValidationResult,
} from "@/app/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  certificatePath,
  formatIssuedDate,
} from "@/lib/certificates/types";

export function AdminVerifyCertificate({
  initialCode = "",
  adminName,
}: {
  initialCode?: string;
  adminName: string;
}) {
  const [code, setCode] = useState(initialCode);

  async function action(
    _prev: AdminValidationResult | null,
    formData: FormData,
  ): Promise<AdminValidationResult> {
    const rawCode = String(formData.get("code") ?? "").trim();
    return validateCertificateAdmin(rawCode);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div className="mt-6 max-w-3xl">
      {/* Formulario de búsqueda/validación de código */}
      <form
        action={formAction}
        className="rounded-[1.4rem] border border-border bg-card p-6 shadow-sm"
      >
        <label htmlFor="code" className="block text-sm font-semibold text-foreground">
          Ingresa el Código de Verificación
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Código alfanumérico único de 8 caracteres emitido para el certificado (ej: 8F72A91C).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={8}
              placeholder="Ej: 8F72A91C"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="auth-field h-11 w-full font-mono uppercase tracking-widest text-base font-bold rounded-2xl border border-border bg-background px-4 text-foreground placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={pending || !code.trim()}
            className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
          >
            <Icon name="verified" size={18} />
            {pending ? "Validando..." : "Validar Certificado"}
          </button>
        </div>
      </form>

      {/* Resultado de la validación */}
      {state ? (
        <div className="mt-6">
          {state.ok ? (
            <div className="rounded-[1.4rem] border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <Icon name="check" size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Certificado Válido y Autenticado
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Registro oficial confirmado en la base de datos de la UMSS
                    </p>
                  </div>
                </div>
                <Badge tone="success">Válido</Badge>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Participante
                  </dt>
                  <dd className="mt-1 text-base font-bold text-foreground">
                    {state.certificate.participant_name}
                  </dd>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Curso Aprobado
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-primary">
                    {state.certificate.course_name}
                  </dd>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Duración Académica
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {state.certificate.hours} horas académicas
                  </dd>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Docente Instructor
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {state.certificate.instructor_name || "Docente Titular"}
                  </dd>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha de Emisión Original
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">
                    {formatIssuedDate(state.certificate.issued_at)}
                  </dd>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Código Verificado
                  </dt>
                  <dd className="mt-1 font-mono text-base font-extrabold tracking-widest text-foreground">
                    {state.certificate.code}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Validado por:</span> {adminName} ·{" "}
                <span className="font-semibold text-foreground">Fecha de validación:</span>{" "}
                {new Date(state.validatedAt).toLocaleString("es-BO")}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={certificatePath(state.certificate.code)}
                  target="_blank"
                  className="auth-submit inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs"
                >
                  <Icon name="visibility" size={16} />
                  Ver Certificado Oficial
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
          ) : (
            <div className="rounded-[1.4rem] border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  <Icon name="close" size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-destructive">
                    Certificado No Válido
                  </h2>
                  <p className="text-xs text-destructive/80">
                    {state.error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

