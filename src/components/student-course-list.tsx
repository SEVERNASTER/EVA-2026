"use client";

import { useActionState, useMemo, useState } from "react";
import { preenroll } from "@/app/actions/enrollments";
import { CourseMeta } from "@/components/course-meta";
import { EligibilityStatus } from "@/components/eligibility-status";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Meter } from "@/components/ui/meter";
import { Money } from "@/components/ui/money";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import type { Course } from "@/lib/courses/types";
import {
  amountForCategory,
  categoryLabel,
  studentCategoryChoiceLabel,
  enrollmentStatusLabel,
  PARTICIPANT_CATEGORIES,
  type Enrollment,
  type ParticipantCategory,
} from "@/lib/enrollments/types";
import type { Eligibility } from "@/lib/eligibility";
import {
  attendancePercent,
  formatAttendance,
  formatScore,
  type CourseProgress,
} from "@/lib/teaching/types";

type State = { error: string } | { ok: true } | null;

export type CourseOutcome = {
  enrollmentId: string;
  eligibility: Eligibility;
  certificateCode: string | null;
  certificateIsValidated?: boolean;
};

export function StudentCourseList({
  courses,
  enrollments,
  progress = {},
  outcomes = {},
}: {
  courses: Course[];
  enrollments: Enrollment[];
  progress?: Record<string, CourseProgress>;
  outcomes?: Record<string, CourseOutcome>;
}) {
  const byCourse = useMemo(() => {
    return new Map(enrollments.map((row) => [row.course_id, row]));
  }, [enrollments]);

  const mine = courses.filter((course) => byCourse.has(course.id));
  const available = courses.filter((course) => !byCourse.has(course.id));
  const outcomeList = Object.values(outcomes);
  const enrolledCount = enrollments.filter((row) => row.status === "inscrito").length;
  const eligibleCount = outcomeList.filter((row) => row.eligibility.eligible).length;
  const certificateCount = outcomeList.filter((row) => row.certificateCode && row.certificateIsValidated).length;

  return (
    <>
      <PageHeader
        icon="school"
        eyebrow="Estudiante"
        title="Tus cursos"
        description="Sigue tu asistencia y nota. Cuando apruebes, administración emitirá tu certificado verificable."
      />

      <StatGrid>
        <StatCard
          icon="how_to_reg"
          label="Inscrito en"
          value={enrolledCount}
          hint={`${enrollments.length - enrolledCount} pendientes de confirmar`}
        />
        <StatCard
          icon="task_alt"
          label="Cursos aprobados"
          value={eligibleCount}
          hint="Cumplen nota y asistencia"
          tone="success"
        />
        <StatCard
          icon="workspace_premium"
          label="Certificados"
          value={certificateCount}
          hint="Con código de verificación"
          tone="gold"
        />
      </StatGrid>

      <CourseSection
        title="Mis cursos"
        empty="Aún no te preinscribiste a ningún curso."
        emptyHint="Elige uno de la oferta disponible."
        courses={mine}
        byCourse={byCourse}
        progress={progress}
        outcomes={outcomes}
      />
      <CourseSection
        title="Oferta disponible"
        empty={courses.length === 0 ? "No hay cursos publicados." : "Ya estás en todos los cursos publicados."}
        courses={available}
        byCourse={byCourse}
        progress={progress}
        outcomes={outcomes}
      />
    </>
  );
}

function CourseSection({
  title,
  empty,
  emptyHint,
  courses,
  byCourse,
  progress,
  outcomes,
}: {
  title: string;
  empty: string;
  emptyHint?: string;
  courses: Course[];
  byCourse: Map<string, Enrollment>;
  progress: Record<string, CourseProgress>;
  outcomes: Record<string, CourseOutcome>;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {courses.length}
        </span>
      </h2>
      {courses.length === 0 ? (
        <EmptyState icon="menu_book" title={empty}>
          {emptyHint}
        </EmptyState>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="card-lift flex rounded-[1.4rem] border border-border bg-card p-5 shadow-sm"
            >
              <StudentCourseCard
                course={course}
                enrollment={byCourse.get(course.id)}
                progress={progress[course.id]}
                outcome={outcomes[course.id]}
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
  outcome,
}: {
  course: Course;
  enrollment?: Enrollment;
  progress?: CourseProgress;
  outcome?: CourseOutcome;
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
    <div className="flex w-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {course.name}
        </h3>
        {enrollment ? (
          <Badge
            tone={
              enrollment.status === "inscrito"
                ? "success"
                : scholarshipPending
                  ? "info"
                  : "warning"
            }
            dot
          >
            {enrollmentStatusLabel(enrollment.status, enrollment.category)}
          </Badge>
        ) : hidePrice ? null : (
          <Money className="text-base" value={course.precio_regular} />
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {course.content}
      </p>
      <div className="mt-3">
        <CourseMeta course={course} />
      </div>

      {enrollment ? (
        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">{categoryLabel(enrollment.category)}</span>
            {scholarshipPending ? (
              <span className="text-muted-foreground">Caja revisará tu solicitud</span>
            ) : (
              <Money value={enrollment.amount} />
            )}
          </div>
          {progress ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Meter
                label="Asistencia"
                value={
                  progress.total === 0
                    ? null
                    : attendancePercent(progress.present, progress.total)
                }
                display={formatAttendance(progress.present, progress.total)}
                min={Number(course.asistencia_minima)}
                minLabel={`Mínimo ${Number(course.asistencia_minima)} %`}
              />
              <Meter
                label="Nota"
                value={progress.score}
                display={formatScore(progress.score)}
                min={Number(course.nota_minima)}
                minLabel={`Mínimo ${Number(course.nota_minima)} / 100`}
              />
            </div>
          ) : null}
          {outcome ? (
            <div className="mt-4">
              <EligibilityStatus
                eligibility={outcome.eligibility}
                enrollmentId={outcome.enrollmentId}
                certificateCode={outcome.certificateCode}
                certificateIsValidated={outcome.certificateIsValidated}
                canIssue={false}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <form action={formAction} className="mt-auto flex flex-col gap-3 pt-5">
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="category" value={category} />
          <div
            className="inline-flex w-fit flex-wrap rounded-2xl bg-muted p-1"
            role="group"
            aria-label="Categoría"
          >
            {PARTICIPANT_CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                className={
                  category === value
                    ? "rounded-xl bg-card px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm"
                    : "rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                }
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
              >
                {studentCategoryChoiceLabel(value)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {category === "beca" ? (
              <span className="text-sm text-muted-foreground">
                Caja revisará la solicitud. No se cobra hasta confirmar.
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Pagarás <Money value={price} />
              </span>
            )}
            <button
              className="auth-submit inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
              type="submit"
              disabled={pending}
            >
              <Icon name="how_to_reg" size={16} />
              {pending ? "Enviando…" : category === "beca" ? "Solicitar beca" : "Preinscribirme"}
            </button>
          </div>
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
