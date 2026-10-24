import Link from "next/link";
import { CourseMeta } from "@/components/course-meta";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import type { Course } from "@/lib/courses/types";

export function CourseCatalog({
  title,
  description,
  empty,
  courses,
  manageHref,
}: {
  title: string;
  description?: string;
  empty: string;
  courses: Course[];
  manageHref?: string;
}) {
  return (
    <section>
      <PageHeader icon="co_present" eyebrow="Instructor" title={title} description={description} />
      {courses.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon="menu_book" title={empty} />
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 lg:grid-cols-2">
          {courses.map((course) => (
            <li
              key={course.id}
              className="card-lift flex flex-col rounded-[1.4rem] border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {course.name}
                </h2>
                <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-foreground">
                  Nota ≥ {Number(course.nota_minima)} · Asist. ≥ {Number(course.asistencia_minima)} %
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {course.content}
              </p>
              <div className="mt-3">
                <CourseMeta course={course} />
              </div>
              {manageHref ? (
                <div className="mt-auto flex justify-end pt-4">
                  <Link
                    className="auth-submit inline-flex h-10 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
                    href={`${manageHref}/${course.id}`}
                  >
                    Sesiones y notas
                    <Icon name="arrow_forward" size={16} />
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
