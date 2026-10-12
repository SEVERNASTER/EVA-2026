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
            <label className="flex items-center gap-3 rounded-md border border-line bg-panel px-4 py-3 text-sm text-zinc-200">
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
          className="auth-submit h-9 w-fit rounded-md bg-white px-3 text-sm font-medium text-black disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? "Guardando…" : "Guardar asistencia"}
        </button>
        {state && "ok" in state && !pending ? (
          <p className="text-sm text-emerald-300">Asistencia guardada.</p>
        ) : null}
      </div>
      {state && "error" in state ? (
        <p className="auth-error rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
