"use client";

import { confirmEnrollment } from "@/app/actions/enrollments";
import { Icon } from "@/components/ui/icon";
import type { EnrollmentSettlement } from "@/lib/enrollments/types";
import { useState } from "react";

export function ConfirmEnrollmentButtons({ id }: { id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<EnrollmentSettlement | null>(null);

  async function confirm(settlement: EnrollmentSettlement) {
    setError(null);
    setPending(settlement);
    const result = await confirmEnrollment(id, settlement);
    if (result?.error) {
      setError(result.error);
    }
    setPending(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          type="button"
          disabled={pending !== null}
          onClick={() => confirm("caja")}
        >
          <Icon name="payments" size={16} />
          {pending === "caja" ? "Registrando…" : "Registrar pago"}
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          type="button"
          disabled={pending !== null}
          onClick={() => confirm("beca")}
        >
          <Icon name="workspace_premium" size={16} />
          {pending === "beca" ? "Aplicando…" : "Aplicar beca"}
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
