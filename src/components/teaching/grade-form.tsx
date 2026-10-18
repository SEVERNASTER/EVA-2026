"use client";

import { useActionState } from "react";
import { saveGrade } from "@/app/actions/teaching";

type State = { error: string } | { ok: true } | null;

export function GradeForm({
  courseId,
  enrollmentId,
  score,
}: {
  courseId: string;
  enrollmentId: string;
  score: number | null;
}) {
  async function action(_prev: State, formData: FormData): Promise<State> {
    return saveGrade(courseId, enrollmentId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          aria-label="Nota"
          className="auth-field h-9 w-20 rounded-2xl border border-border bg-background px-2 text-right text-sm text-foreground"
          name="score"
          type="number"
          min={0}
          max={100}
          step="0.01"
          required
          defaultValue={score ?? ""}
        />
        <button
          className="text-sm text-foreground underline-offset-4 hover:underline disabled:opacity-50"
          type="submit"
          disabled={pending}
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {state && "error" in state ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state && "ok" in state && !pending ? (
        <p className="text-xs text-accent-foreground">Guardada.</p>
      ) : null}
    </form>
  );
}
