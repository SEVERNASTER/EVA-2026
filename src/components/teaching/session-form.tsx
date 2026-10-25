"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/app/actions/teaching";

type State = { error: string } | { ok: true } | null;

const fieldClass =
  "auth-field h-10 rounded-2xl border border-input bg-card px-3 text-sm text-foreground";

export function SessionForm({ courseId }: { courseId: string }) {
  const router = useRouter();

  async function action(_prev: State, formData: FormData): Promise<State> {
    return createSession(courseId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state && "ok" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Fecha
          <input className={fieldClass} name="session_date" type="date" required />
        </label>
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs text-muted-foreground">
          Tema
          <input
            className={`${fieldClass} w-full`}
            name="topic"
            required
            placeholder="Ej. Rutas y middlewares"
          />
        </label>
        <button
          className="auth-submit h-10 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? "Agregando…" : "Agregar sesión"}
        </button>
      </div>
      {state && "error" in state ? (
        <p className="auth-error rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}