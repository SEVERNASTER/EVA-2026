"use client";

import { useState } from "react";
import { approveCertificateByEnrollment } from "@/app/actions/certificates";
import { Icon } from "@/components/ui/icon";

export function AdminApproveCertificateButton({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setPending(true);
    setError(null);
    const result = await approveCertificateByEnrollment(enrollmentId);
    if ("error" in result) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={handleApprove}
        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
      >
        <Icon name="check_circle" size={14} />
        {pending ? "Aprobando..." : "Aprobar Certificado"}
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}

