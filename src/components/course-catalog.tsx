import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import type { Course } from "@/lib/courses/types";

export function CourseCatalog({
  title,
  empty,
  courses,
  manageHref,
}: {
  title: string;
  empty: string;
  courses: Course[];
  manageHref?: string;
}) {
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-[1.4rem] border border-border bg-card px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-medium text-foreground">{course.name}</h2>
                <Money value={course.precio_regular} />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{course.content}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="schedule" size={14} />
                  {course.hours} h · {course.schedule}
                  {course.instructor?.full_name
                    ? ` · ${course.instructor.full_name}`
                    : ""}
                </p>
                {manageHref ? (
                  <Link
                    className="inline-flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                    href={`${manageHref}/${course.id}`}
                  >
                    Gestionar curso
                    <Icon name="arrow_forward" size={16} />
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
