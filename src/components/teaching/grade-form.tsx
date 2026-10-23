"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function action(_prev: State, formData: FormData): Promise<State> {
    return saveGrade(courseId, enrollmentId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state && "ok" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          aria-label="Nota"
          className="auth-field h-9 w-20 rounded-2xl border border-input bg-card px-2 text-right text-sm text-foreground"
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
        <p className="text-xs text-success-foreground">Guardada.</p>
      ) : null}
    </form>
  );
}