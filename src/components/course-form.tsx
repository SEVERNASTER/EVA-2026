"use client";

import { useActionState, useState } from "react";
import { createCourse, updateCourse } from "@/app/actions/courses";
import { Icon } from "@/components/ui/icon";
import {
  WEEKDAYS,
  emptySlot,
  type ScheduleSlot,
} from "@/lib/courses/schedule";
import type { Course } from "@/lib/courses/types";

type InstructorOption = { id: string; full_name: string };
type State = { error: string } | null;

const fieldClass =
  "auth-field h-11 w-full rounded-2xl border border-border bg-background px-3.5 text-sm text-foreground";

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 text-sm ${className}`}>
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function CourseForm({
  course,
  instructors,
}: {
  course?: Course;
  instructors: InstructorOption[];
}) {
  async function action(_prev: State, formData: FormData): Promise<State> {
    const result = course
      ? await updateCourse(course.id, formData)
      : await createCourse(formData);
    return result ?? null;
  }

  const [state, formAction, pending] = useActionState(action, null);
  const [slots, setSlots] = useState<ScheduleSlot[]>(
    course?.course_schedule_slots?.length
      ? course.course_schedule_slots
      : [emptySlot()],
  );

  function updateSlot(index: number, patch: Partial<ScheduleSlot>) {
    setSlots((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-7"
    >
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold text-foreground">Identidad</legend>
        <Field className="md:col-span-2" label="Nombre">
          <input
            className={fieldClass}
            name="name"
            required
            defaultValue={course?.name}
          />
        </Field>

        <Field className="md:col-span-2" label="Contenido">
          <textarea
            className="auth-field min-h-32 w-full resize-y rounded-2xl border border-border bg-background px-3.5 py-3 text-sm text-foreground"
            name="content"
            required
            defaultValue={course?.content}
          />
        </Field>

        <Field className="md:col-span-2" label="Horas">
          <input
            className={fieldClass}
            name="hours"
            type="number"
            min={1}
            required
            defaultValue={course?.hours ?? 40}
          />
        </Field>

        <div className="md:col-span-2 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Horarios semanales</p>
          <p className="text-xs text-muted-foreground">
            Las horas se guardan en 24 h (18:30, no 6:30 p. m.).
          </p>
          {slots.map((slot, index) => (
            <div
              key={`${slot.weekday}-${index}`}
              className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Día</span>
                <select
                  className={`${fieldClass} appearance-none`}
                  name="slot_weekday"
                  value={slot.weekday}
                  onChange={(event) =>
                    updateSlot(index, { weekday: Number(event.target.value) })
                  }
                  required
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Inicio · 24 h</span>
                <input
                  className={fieldClass}
                  name="slot_starts"
                  type="time"
                  step={60}
                  lang="es-BO"
                  required
                  aria-label="Hora de inicio, formato 24 horas"
                  value={slot.starts_at.slice(0, 5)}
                  onChange={(event) =>
                    updateSlot(index, { starts_at: event.target.value })
                  }
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Fin · 24 h</span>
                <input
                  className={fieldClass}
                  name="slot_ends"
                  type="time"
                  step={60}
                  lang="es-BO"
                  aria-label="Hora de fin, formato 24 horas"
                  value={slot.ends_at?.slice(0, 5) ?? ""}
                  onChange={(event) =>
                    updateSlot(index, { ends_at: event.target.value || null })
                  }
                />
              </label>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center self-end rounded-2xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                onClick={() =>
                  setSlots((current) => current.filter((_, i) => i !== index))
                }
                disabled={slots.length === 1}
                aria-label="Quitar horario"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex w-fit items-center gap-1 rounded-2xl px-3 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => setSlots((current) => [...current, emptySlot()])}
          >
            <Icon name="add" size={16} />
            Agregar horario
          </button>
        </div>
      </fieldset>

      <fieldset className="mt-8 grid gap-5 border-t border-border pt-6 md:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold text-foreground">Precios</legend>
        <Field label="Precio regular (Bs)">
          <input
            className={fieldClass}
            name="precio_regular"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={course?.precio_regular ?? 0}
          />
        </Field>

        <Field
          label="Precio auxiliar ad-honorem (Bs)"
          hint="Usa 0 si el auxiliar no paga."
        >
          <input
            className={fieldClass}
            name="precio_auxiliar"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={course?.precio_auxiliar ?? 0}
          />
        </Field>
      </fieldset>

      <fieldset className="mt-8 grid gap-5 border-t border-border pt-6 md:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold text-foreground">Requisitos</legend>
        <Field className="md:col-span-2" label="Instructor">
          <span className="relative block">
            <select
              className={`${fieldClass} appearance-none pr-10`}
              name="instructor_id"
              required
              defaultValue={course?.instructor_id}
            >
              <option value="">Seleccionar</option>
              {instructors.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.full_name}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              size={18}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            />
          </span>
        </Field>

        <Field label="Nota mínima">
          <input
            className={fieldClass}
            name="nota_minima"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            defaultValue={course?.nota_minima ?? 70}
          />
        </Field>

        <Field label="Asistencia mínima (%)">
          <input
            className={fieldClass}
            name="asistencia_minima"
            type="number"
            min={0}
            max={100}
            step="0.01"
            required
            defaultValue={course?.asistencia_minima ?? 80}
          />
        </Field>
      </fieldset>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input
            className="peer sr-only"
            name="published"
            type="checkbox"
            defaultChecked={course?.published}
          />
          <span className="flex size-6 items-center justify-center rounded-lg border-2 border-muted-foreground bg-background peer-checked:border-primary peer-checked:bg-primary peer-checked:[&_.material-symbols-outlined]:opacity-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground">
            <Icon name="check" size={16} className="text-primary-foreground opacity-0" />
          </span>
          Publicado (visible en el catálogo)
        </label>

        <button
          className="auth-submit inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          <Icon name={course ? "check" : "add"} size={18} />
          {pending ? "Guardando…" : course ? "Guardar" : "Crear curso"}
        </button>
      </div>

      {state?.error ? (
        <p className="auth-error mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
