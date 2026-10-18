"use client";

import { useActionState, useMemo, useState } from "react";
import { preenroll } from "@/app/actions/enrollments";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import type { Course } from "@/lib/courses/types";
import {
  amountForCategory,
  categoryLabel,
  enrollmentStatusLabel,
  PARTICIPANT_CATEGORIES,
  type Enrollment,
  type ParticipantCategory,
} from "@/lib/enrollments/types";
import {
  formatAttendance,
  formatScore,
  type CourseProgress,
} from "@/lib/teaching/types";

type State = { error: string } | { ok: true } | null;

export function StudentCourseList({
  courses,
  enrollments,
  progress = {},
}: {
  courses: Course[];
  enrollments: Enrollment[];
  progress?: Record<string, CourseProgress>;
}) {
  const byCourse = useMemo(() => {
    return new Map(enrollments.map((row) => [row.course_id, row]));
  }, [enrollments]);

  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Oferta de cursos
      </h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No hay cursos publicados.</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-[1.4rem] border border-border bg-card px-5 py-4 shadow-sm"
            >
              <StudentCourseCard
                course={course}
                enrollment={byCourse.get(course.id)}
                progress={progress[course.id]}
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
  progress,
}: {
  course: Course;
  enrollment?: Enrollment;
  progress?: CourseProgress;
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
        <h2 className="text-sm font-medium text-foreground">{course.name}</h2>
        <p className="text-sm text-muted-foreground">
          Regular <Money value={course.precio_regular} />
          {course.precio_auxiliar > 0 ? (
            <>
              {" · "}Auxiliar <Money value={course.precio_auxiliar} />
            </>
          ) : (
            " · Auxiliar / beca Bs 0"
          )}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.content}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {course.hours} h · {course.schedule}
        {course.instructor?.full_name ? ` · ${course.instructor.full_name}` : ""}
      </p>

      {enrollment ? (
        <p className="mt-4 text-sm text-foreground">
          {enrollmentStatusLabel(enrollment.status)}
          {" · "}
          {categoryLabel(enrollment.category)}
          {" · "}
          <Money value={enrollment.amount} />
          {progress ? (
            <span className="mt-1 block text-muted-foreground">
              Asistencia {formatAttendance(progress.present, progress.total)}
              {" · "}
              Nota {formatScore(progress.score)}
            </span>
          ) : null}
        </p>
      ) : (
        <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="course_id" value={course.id} />
          <label className="flex min-w-48 flex-col gap-1 text-xs text-muted-foreground">
            Categoría
            <select
              className="auth-field h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
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
          <p className="pb-2 text-sm">
            <Money value={price} />
          </p>
          <button
            className="auth-submit inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            <Icon name="how_to_reg" size={16} />
            {pending ? "Enviando…" : "Preinscribirme"}
          </button>
        </form>
      )}

      {state && "error" in state ? (
        <p className="auth-error mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
