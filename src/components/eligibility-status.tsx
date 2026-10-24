"use client";

import Link from "next/link";
import { useState } from "react";
import { issueCertificate } from "@/app/actions/certificates";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { certificatePath } from "@/lib/certificates/types";
import type { Eligibility } from "@/lib/eligibility";

export function EligibilityStatus({
  eligibility,
  enrollmentId,
  certificateCode,
  canIssue,
}: {
  eligibility: Eligibility;
  enrollmentId: string;
  certificateCode: string | null;
  canIssue: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function issue() {
    setError(null);
    setPending(true);
    const result = await issueCertificate(enrollmentId);
    if ("error" in result) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone={eligibility.eligible ? "success" : "warning"}>
          <Icon name={eligibility.eligible ? "task_alt" : "pending"} size={14} />
          {eligibility.eligible ? "Apto para certificar" : "Aún no apto"}
        </Badge>
        {eligibility.failed.map((item) => (
          <span key={item.criterion} className="text-xs text-muted-foreground">
            {item.message}
          </span>
        ))}
        {certificateCode ? (
          <Link
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gold-soft px-3 py-1.5 text-sm font-semibold text-gold-foreground ring-1 ring-inset ring-gold/40 transition-colors hover:bg-gold/20"
            href={certificatePath(certificateCode)}
          >
            <Icon name="workspace_premium" filled size={16} />
            Ver certificado
            <span className="font-mono text-xs tracking-wider">{certificateCode}</span>
          </Link>
        ) : eligibility.eligible && canIssue ? (
          <button
            className="auth-submit inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-50"
            type="button"
            disabled={pending}
            onClick={issue}
          >
            <Icon name="workspace_premium" size={16} />
            {pending ? "Emitiendo…" : "Emitir certificado"}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
