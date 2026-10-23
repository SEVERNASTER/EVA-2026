"use client";

import { useActionState, useState, useEffect, useRef } from "react";
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
  // Controlled presence state per enrollment
  const [presences, setPresences] = useState<Record<string, boolean>>(
    () => Object.fromEntries(entries.map((e) => [e.enrollmentId, e.present])),
  );

  const selectedCount = Object.values(presences).filter(Boolean).length;
  const total = entries.length;
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && selectedCount < total;

  // Ref for the indeterminate state of the master checkbox
  const masterRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleAll(checked: boolean) {
    setPresences(
      Object.fromEntries(entries.map((e) => [e.enrollmentId, checked])),
    );
  }

  function toggleOne(enrollmentId: string, checked: boolean) {
    setPresences((prev) => ({ ...prev, [enrollmentId]: checked }));
  }

  async function action(_prev: State, formData: FormData): Promise<State> {
    return saveAttendance(courseId, sessionId, formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      {/* Master row */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-foreground">
          <input
            ref={masterRef}
            type="checkbox"
            checked={allSelected}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          Seleccionar todos
        </label>
        <span className="text-xs text-muted-foreground">
          Seleccionados:&nbsp;
          <span className="font-semibold text-foreground">{selectedCount}</span>
          &nbsp;/&nbsp;{total}
        </span>
      </div>

      {/* Student list */}
      <ul className="grid gap-2">
        {entries.map((entry) => (
          <li key={entry.enrollmentId}>
            {/* Hidden input so unchecked values are still submitted */}
            <input
              type="hidden"
              name={`present_${entry.enrollmentId}`}
              value="false"
            />
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
              <input
                name={`present_${entry.enrollmentId}`}
                type="checkbox"
                checked={presences[entry.enrollmentId] ?? false}
                value="true"
                onChange={(e) => toggleOne(entry.enrollmentId, e.target.checked)}
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