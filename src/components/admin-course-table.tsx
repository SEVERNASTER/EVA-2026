"use client";

import { useMemo, useState } from "react";
import { CourseRowActions } from "@/components/course-row-actions";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/ui/money";
import type { Course } from "@/lib/courses/types";

export function AdminCourseTable({ courses }: { courses: Course[] }) {
  const [filter, setFilter] = useState<"todos" | "publicado" | "borrador">("todos");
  const visible = useMemo(() => {
    if (filter === "publicado") return courses.filter((course) => course.published);
    if (filter === "borrador") return courses.filter((course) => !course.published);
    return courses;
  }, [courses, filter]);

  return (
    <>
      <div className="mt-6 inline-flex rounded-2xl border border-border bg-card p-1 text-sm">
        {(
          [
            ["todos", "Todos"],
            ["publicado", "Publicados"],
            ["borrador", "Borradores"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              filter === value
                ? "rounded-xl bg-sidebar-accent px-3 py-1.5 font-medium text-sidebar-accent-foreground"
                : "rounded-xl px-3 py-1.5 text-muted-foreground hover:text-foreground"
            }
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="hidden px-3 py-3 font-medium sm:table-cell">Horas</th>
              <th className="px-3 py-3 font-medium">Precio</th>
              <th className="px-3 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((course) => (
              <tr key={course.id} className="border-t border-border hover:bg-muted/40">
                <td className="px-5 py-3.5 font-medium text-foreground">{course.name}</td>
                <td className="hidden px-3 py-3.5 text-muted-foreground sm:table-cell">
                  {course.hours} h
                </td>
                <td className="px-3 py-3.5">
                  <Money value={course.precio_regular} />
                </td>
                <td className="px-3 py-3.5">
                  <Badge tone={course.published ? "success" : "muted"}>
                    {course.published ? "Publicado" : "Borrador"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <CourseRowActions
                    id={course.id}
                    name={course.name}
                    published={course.published}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
