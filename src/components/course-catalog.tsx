import { formatBs, type Course } from "@/lib/courses/types";

export function CourseCatalog({
  title,
  empty,
  courses,
}: {
  title: string;
  empty: string;
  courses: Course[];
}) {
  return (
    <section>
      <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
      {courses.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-lg border border-line bg-panel px-5 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-medium text-white">{course.name}</h2>
                <p className="text-sm text-zinc-400">{formatBs(course.precio_regular)}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{course.content}</p>
              <p className="mt-3 text-xs text-zinc-500">
                {course.hours} h · {course.schedule}
                {course.instructor?.full_name
                  ? ` · ${course.instructor.full_name}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
