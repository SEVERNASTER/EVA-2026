"use client";

import { useMemo, useState } from "react";
import { CourseRowActions } from "@/components/course-row-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
      <div className="mt-10 inline-flex rounded-2xl bg-muted p-1 text-sm">
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
                ? "rounded-xl bg-card px-3.5 py-1.5 font-semibold text-foreground shadow-sm"
                : "rounded-xl px-3.5 py-1.5 text-muted-foreground hover:text-foreground"
            }
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="menu_book" title="No hay cursos en esta vista">
            Crea un curso nuevo o cambia el filtro.
          </EmptyState>
        </div>
      ) : (
      <div className="mt-4 overflow-x-auto rounded-[1.4rem] border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Curso</th>
              <th className="hidden px-3 py-3 font-semibold sm:table-cell">Horas</th>
              <th className="px-3 py-3 font-semibold">Precio</th>
              <th className="px-3 py-3 font-semibold">Estado</th>
              <th className="px-5 py-3 font-semibold">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((course) => (
              <tr key={course.id} className="border-t border-border first:border-t-0 hover:bg-muted/50">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-foreground">{course.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {course.instructor?.full_name ?? "Sin instructor"}
                  </p>
                </td>
                <td className="hidden px-3 py-3.5 text-muted-foreground sm:table-cell">
                  {course.hours} h
                </td>
                <td className="px-3 py-3.5">
                  <Money value={course.precio_regular} />
                </td>
                <td className="px-3 py-3.5">
                  <Badge tone={course.published ? "success" : "muted"} dot>
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
      )}
    </>
  );
}
