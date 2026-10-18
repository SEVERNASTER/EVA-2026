import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { formatSlot } from "@/lib/courses/schedule";
import { courseScheduleLabel, type Course } from "@/lib/courses/types";

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
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {course.name}
                </h2>
                <Money className="text-base" value={course.precio_regular} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {course.content}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                </p>
                {manageHref ? (
                  <Link
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-2xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    href={`${manageHref}/${course.id}`}
                  >
                    Gestionar
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
