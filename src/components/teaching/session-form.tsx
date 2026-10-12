"use client";

import { useActionState } from "react";
import { createSession } from "@/app/actions/teaching";

type State = { error: string } | { ok: true } | null;

const fieldClass =
  "auth-field h-9 rounded-md border border-line bg-input px-3 text-sm text-foreground";

export function SessionForm({ courseId }: { courseId: string }) {
  async function action(_prev: State, formData: FormData): Promise<State> {
    return createSession(courseId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Fecha
          <input className={fieldClass} name="session_date" type="date" required />
        </label>
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs text-zinc-500">
          Tema
          <input
            className={`${fieldClass} w-full`}
            name="topic"
            required
            placeholder="Ej. Rutas y middlewares"
          />
        </label>
        <button
          className="auth-submit h-9 rounded-md bg-white px-3 text-sm font-medium text-black disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? "Agregando…" : "Agregar sesión"}
        </button>
      </div>
      {state && "error" in state ? (
        <p className="auth-error rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
