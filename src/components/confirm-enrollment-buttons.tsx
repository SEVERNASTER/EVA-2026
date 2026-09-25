"use client";

import { confirmEnrollment } from "@/app/actions/enrollments";
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
      <div className="flex flex-wrap justify-end gap-3">
        <button
          className="text-zinc-300 underline-offset-4 hover:underline disabled:opacity-50"
          type="button"
          disabled={pending !== null}
          onClick={() => confirm("caja")}
        >
          {pending === "caja" ? "Registrando…" : "Registrar pago"}
        </button>
        <button
          className="text-zinc-400 hover:text-white disabled:opacity-50"
          type="button"
          disabled={pending !== null}
          onClick={() => confirm("beca")}
        >
          {pending === "beca" ? "Aplicando…" : "Aplicar beca"}
        </button>
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
