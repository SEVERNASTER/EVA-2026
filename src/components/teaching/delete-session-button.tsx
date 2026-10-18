"use client";

import { useState, useTransition } from "react";
import { deleteSession } from "@/app/actions/teaching";

export function DeleteSessionButton({
  courseId,
  sessionId,
}: {
  courseId: string;
  sessionId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!window.confirm("¿Eliminar la sesión y su asistencia registrada?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteSession(courseId, sessionId);
      if ("error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        className="text-muted-foreground hover:text-destructive disabled:opacity-50"
        type="button"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </span>
  );
}
