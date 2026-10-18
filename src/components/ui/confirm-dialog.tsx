"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  pending = false,
  confirmTone = "primary",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  pending?: boolean;
  confirmTone?: "primary" | "quiet";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-[1.4rem] border border-border bg-card p-5 shadow-lg"
      >
        <h2 id="confirm-title" className="text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={
              confirmTone === "quiet"
                ? "rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
                : "auth-submit rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            }
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Confirmando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
