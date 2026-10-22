"use client";

import { useActionState } from "react";
import { saveAttendance } from "@/app/actions/teaching";

type State = { error: string } | { ok: true } | null;

export type AttendanceEntry = {
  enrollmentId: string;
  name: string;
  present: boolean;
};

export function AttendanceForm({
  courseId,
  sessionId,
  entries,
}: {
  courseId: string;
  sessionId: string;
  entries: AttendanceEntry[];
}) {
  async function action(_prev: State, formData: FormData): Promise<State> {
    return saveAttendance(courseId, sessionId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <ul className="grid gap-2">
        {entries.map((entry) => (
          <li key={entry.enrollmentId}>
            <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
              <input
                name={`present_${entry.enrollmentId}`}
                type="checkbox"
                defaultChecked={entry.present}
              />
              {entry.name}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="auth-submit h-10 w-fit rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? "Guardando…" : "Guardar asistencia"}
        </button>
        {state && "ok" in state && !pending ? (
          <p className="text-sm text-accent-foreground">Asistencia guardada.</p>
        ) : null}
      </div>
      {state && "error" in state ? (
        <p className="auth-error rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
