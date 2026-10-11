"use client";

import { useActionState, useMemo, useState } from "react";
import { preenroll } from "@/app/actions/enrollments";
import { formatBs, type Course } from "@/lib/courses/types";
import {
  amountForCategory,
  categoryLabel,
  enrollmentStatusLabel,
  PARTICIPANT_CATEGORIES,
  type Enrollment,
  type ParticipantCategory,
} from "@/lib/enrollments/types";

type State = { error: string } | { ok: true } | null;

export function StudentCourseList({
  courses,
  enrollments,
}: {
  courses: Course[];
  enrollments: Enrollment[];
}) {
  const byCourse = useMemo(() => {
    return new Map(enrollments.map((row) => [row.course_id, row]));
  }, [enrollments]);

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-white">
        Oferta de cursos
      </h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">No hay cursos publicados.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-lg border border-line bg-panel px-5 py-4"
            >
              <StudentCourseCard
                course={course}
                enrollment={byCourse.get(course.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StudentCourseCard({
  course,
  enrollment,
}: {
  course: Course;
  enrollment?: Enrollment;
}) {
  const [category, setCategory] = useState<ParticipantCategory>("regular");
  const price = amountForCategory(
    category,
    course.precio_regular,
    course.precio_auxiliar,
  );

  async function action(_prev: State, formData: FormData): Promise<State> {
    return preenroll(formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-white">{course.name}</h2>
        <p className="text-sm text-zinc-400">
          Regular {formatBs(course.precio_regular)}
          {course.precio_auxiliar > 0
            ? ` · Auxiliar ${formatBs(course.precio_auxiliar)}`
            : " · Auxiliar / beca Bs 0"}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{course.content}</p>
      <p className="mt-3 text-xs text-zinc-500">
        {course.hours} h · {course.schedule}
        {course.instructor?.full_name ? ` · ${course.instructor.full_name}` : ""}
      </p>

      {enrollment ? (
        <p className="mt-4 text-sm text-zinc-300">
          {enrollmentStatusLabel(enrollment.status)}
          {" · "}
          {categoryLabel(enrollment.category)}
          {" · "}
          {formatBs(enrollment.amount)}
        </p>
      ) : (
        <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="course_id" value={course.id} />
          <label className="flex min-w-48 flex-col gap-1 text-xs text-zinc-500">
            Categoría
            <select
              className="auth-field h-9 rounded-md border border-line bg-input px-2 text-sm text-foreground"
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ParticipantCategory)
              }
            >
              {PARTICIPANT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel(value)}
                </option>
              ))}
            </select>
          </label>
          <p className="pb-2 text-sm text-zinc-400">{formatBs(price)}</p>
          <button
            className="auth-submit h-9 rounded-md bg-white px-3 text-sm font-medium text-black disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            {pending ? "Enviando…" : "Preinscribirme"}
          </button>
        </form>
      )}

      {state && "error" in state ? (
        <p className="auth-error mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
