"use client";

import { useState } from "react";
import {
  confirmEnrollment,
  rejectScholarship,
} from "@/app/actions/enrollments";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { formatBs } from "@/lib/courses/types";
import type { EnrollmentSettlement } from "@/lib/enrollments/types";

export function ConfirmEnrollmentButtons({
  id,
  studentName,
  courseName,
  amount,
  scholarshipRequest,
}: {
  id: string;
  studentName: string;
  courseName: string;
  amount: number;
  scholarshipRequest: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"caja" | "beca" | "reject" | null>(null);
  const [ask, setAsk] = useState<"caja" | "beca" | "reject" | null>(null);

  async function run(kind: "caja" | "beca" | "reject") {
    setError(null);
    setPending(kind);
    const result =
      kind === "reject"
        ? await rejectScholarship(id)
        : await confirmEnrollment(id, kind as EnrollmentSettlement);
    if (result && "error" in result && result.error) {
      setError(result.error);
    }
    setPending(null);
    setAsk(null);
  }

  const dialog =
    ask === "caja"
      ? {
          title: "Registrar pago en caja",
          body: `Vas a confirmar a ${studentName} en ${courseName} por ${formatBs(amount)}. Esta acción no se deshace.`,
          confirmLabel: "Registrar pago",
        }
      : ask === "beca"
        ? {
            title: scholarshipRequest ? "Confirmar beca" : "Aplicar beca",
            body: `Vas a inscribir a ${studentName} en ${courseName} sin cobro. Revisa el expediente antes de confirmar.`,
            confirmLabel: "Confirmar beca",
          }
        : ask === "reject"
          ? {
              title: "Pasar a pago regular",
              body: `${studentName} quedará pendiente de cobro del precio regular de ${courseName}.`,
              confirmLabel: "Pasar a pago",
            }
          : null;

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {scholarshipRequest ? (
          <>
            <button
              className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              type="button"
              disabled={pending !== null}
              onClick={() => setAsk("beca")}
            >
              <Icon name="workspace_premium" size={16} />
              Confirmar beca
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-2xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              type="button"
              disabled={pending !== null}
              onClick={() => setAsk("reject")}
            >
              Pasar a pago
            </button>
          </>
        ) : (
          <>
            <button
              className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              type="button"
              disabled={pending !== null}
              onClick={() => setAsk("caja")}
            >
              <Icon name="payments" size={16} />
              Registrar pago
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-2xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              type="button"
              disabled={pending !== null}
              onClick={() => setAsk("beca")}
            >
              <Icon name="workspace_premium" size={16} />
              Aplicar beca
            </button>
          </>
        )}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {dialog && ask ? (
        <ConfirmDialog
          open
          title={dialog.title}
          body={dialog.body}
          confirmLabel={dialog.confirmLabel}
          pending={pending !== null}
          confirmTone={ask === "caja" ? "quiet" : "primary"}
          onCancel={() => setAsk(null)}
          onConfirm={() => run(ask)}
        />
      ) : null}
    </div>
  );
}
