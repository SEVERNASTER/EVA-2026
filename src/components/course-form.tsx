"use client";

import { useActionState } from "react";
import { createCourse, updateCourse } from "@/app/actions/courses";
import { Icon } from "@/components/ui/icon";
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

  return (
    <form
      action={formAction}
      className="max-w-3xl rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">
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

        <Field label="Horas">
          <input
            className={fieldClass}
            name="hours"
            type="number"
            min={1}
            required
            defaultValue={course?.hours ?? 40}
          />
        </Field>

        <Field label="Horario">
          <input
            className={fieldClass}
            name="schedule"
            required
            placeholder="Martes y jueves 19:00"
            defaultValue={course?.schedule}
          />
        </Field>

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

        <Field className="md:col-span-2" label="Instructor">
          <select
            className={fieldClass}
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
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-2.5 text-sm text-foreground">
          <input
            className="size-4 rounded-md accent-primary"
            name="published"
            type="checkbox"
            defaultChecked={course?.published}
          />
          Publicado (visible en el catálogo)
        </label>

        <button
          className="auth-submit inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          <Icon name={course ? "save" : "add"} size={18} />
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
