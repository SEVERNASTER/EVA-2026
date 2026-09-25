"use client";

import { useActionState } from "react";
import { createCourse, updateCourse } from "@/app/actions/courses";
import type { Course } from "@/lib/courses/types";

type InstructorOption = { id: string; full_name: string };
type State = { error: string } | null;

const fieldClass =
  "auth-field h-10 w-full rounded-md border border-line bg-input px-3 text-sm text-foreground";

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
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Nombre</span>
        <input
          className={fieldClass}
          name="name"
          required
          defaultValue={course?.name}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Contenido</span>
        <textarea
          className="auth-field min-h-28 w-full rounded-md border border-line bg-input px-3 py-2 text-sm text-foreground"
          name="content"
          required
          defaultValue={course?.content}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-400">Horas</span>
          <input
            className={fieldClass}
            name="hours"
            type="number"
            min={1}
            required
            defaultValue={course?.hours ?? 40}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-400">Precio regular (Bs)</span>
          <input
            className={fieldClass}
            name="precio_regular"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={course?.precio_regular ?? 0}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Horario</span>
        <input
          className={fieldClass}
          name="schedule"
          required
          defaultValue={course?.schedule}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Instructor</span>
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
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-400">Nota mínima</span>
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
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-400">Asistencia mínima (%)</span>
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
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          name="published"
          type="checkbox"
          defaultChecked={course?.published}
        />
        Publicado (visible en el catálogo)
      </label>

      {state?.error ? (
        <p className="auth-error rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        className="auth-submit mt-1 h-10 w-fit rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Guardando…" : course ? "Guardar" : "Crear curso"}
      </button>
    </form>
  );
}
