"use client";

import { useActionState, useMemo, useState } from "react";
import { preenroll } from "@/app/actions/enrollments";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { formatSlot } from "@/lib/courses/schedule";
import { courseScheduleLabel, type Course } from "@/lib/courses/types";
import {
  eligibilityLabel,
  failedCriterionLabel,
  type EligibilityResult,
} from "@/lib/eligibility/types";
import {
  amountForCategory,
  categoryLabel,
  studentCategoryChoiceLabel,
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
  eligibilities = {},
}: {
  courses: Course[];
  enrollments: Enrollment[];
  progress?: Record<string, CourseProgress>;
  eligibilities?: Record<string, EligibilityResult>;
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
                eligibility={eligibilities[course.id]}
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
  eligibility,
}: {
  course: Course;
  enrollment?: Enrollment;
  progress?: CourseProgress;
  eligibility?: EligibilityResult;
}) {
  const [category, setCategory] = useState<ParticipantCategory>("regular");
  const price = amountForCategory(
    category,
    course.precio_regular,
    course.precio_auxiliar,
  );
  const scholarshipPending =
    enrollment?.category === "beca" && enrollment.status !== "inscrito";
  const hidePrice = scholarshipPending || (!enrollment && category === "beca");

  async function action(_prev: State, formData: FormData): Promise<State> {
    return preenroll(formData);
  }

  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {course.name}
        </h2>
        {hidePrice ? (
          <span className="max-w-[11rem] text-right text-sm leading-5 text-muted-foreground">
            Solicitud · sin cobro hasta caja
          </span>
        ) : (
          <Money className="text-base" value={course.precio_regular} />
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {course.content}
      </p>
      <p className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2.5 py-1">{course.hours} h</span>
        {(course.course_schedule_slots ?? []).length > 0
          ? course.course_schedule_slots!.map((slot) => (
              <span
                key={`${slot.weekday}-${slot.starts_at}`}
                className="rounded-full bg-muted px-2.5 py-1"
              >
                {formatSlot(slot)}
              </span>
            ))
          : (
              <span className="rounded-full bg-muted px-2.5 py-1">
                {courseScheduleLabel(course)}
              </span>
            )}
        {course.instructor?.full_name ? (
          <span className="rounded-full bg-muted px-2.5 py-1">
            {course.instructor.full_name}
          </span>
        ) : null}
        {!hidePrice && course.precio_auxiliar > 0 ? (
          <span className="rounded-full bg-muted px-2.5 py-1">
            Auxiliar <Money value={course.precio_auxiliar} />
          </span>
        ) : null}
      </p>

      {enrollment ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <Badge tone={enrollment.status === "inscrito" ? "success" : "warning"}>
            {enrollmentStatusLabel(enrollment.status, enrollment.category)}
          </Badge>
          {enrollment.status === "inscrito" && eligibility ? (
            <Badge tone={eligibility.eligible ? "success" : "destructive"}>
              {eligibilityLabel(eligibility)}
            </Badge>
          ) : null}
          <span className="text-muted-foreground">{categoryLabel(enrollment.category)}</span>
          {enrollment.category === "beca" && enrollment.status !== "inscrito" ? (
            <span className="text-sm text-muted-foreground">
              Caja revisará tu solicitud
            </span>
          ) : (
            <Money value={enrollment.amount} />
          )}
          {progress ? (
            <span className="basis-full text-muted-foreground">
              Asistencia {formatAttendance(progress.present, progress.total)}
              {" · "}
              Nota {formatScore(progress.score)}
              {progress.score !== null && progress.score < course.nota_minima
                ? ` · bajo el mínimo (${Number(course.nota_minima)})`
                : ""}
            </span>
          ) : null}
          {enrollment.status === "inscrito" &&
          eligibility &&
          !eligibility.eligible &&
          eligibility.reasons.length > 0 ? (
            <div className="mt-1.5 basis-full rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
              <p className="font-medium">Criterios no cumplidos para certificación:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {eligibility.reasons.map((reason) => (
                  <li key={reason.criterion}>{failedCriterionLabel(reason)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="category" value={category} />
          <div
            className="inline-flex flex-wrap rounded-2xl border border-border bg-background p-1"
            role="group"
            aria-label="Categoría"
          >
            {PARTICIPANT_CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                className={
                  category === value
                    ? "rounded-xl bg-sidebar-accent px-3 py-1.5 text-sm font-medium text-sidebar-accent-foreground"
                    : "rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                }
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
              >
                {studentCategoryChoiceLabel(value)}
              </button>
            ))}
          </div>
          {category === "beca" ? (
            <span className="text-sm text-muted-foreground">
              Caja revisará la solicitud. No se cobra hasta confirmar.
            </span>
          ) : (
            <Money value={price} />
          )}
          <button
            className="auth-submit inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            <Icon name="how_to_reg" size={16} />
            {pending ? "Enviando…" : category === "beca" ? "Solicitar beca" : "Preinscribirme"}
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
