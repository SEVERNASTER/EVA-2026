import Link from "next/link";
import { setCoursePublished } from "@/app/actions/courses";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name)")
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];

  return (
    <AppShell role="admin" name={profile.full_name}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Cursos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length} cursos en el catálogo interno
          </p>
        </div>
        <Link
          className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground"
          href="/admin/cursos/nuevo"
        >
          <Icon name="add" size={18} />
          Nuevo curso
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/70 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-3 py-3 font-medium">Horas</th>
                <th className="px-3 py-3 font-medium">Precio</th>
                <th className="px-3 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-t border-border hover:bg-muted/40"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {course.name}
                  </td>
                  <td className="px-3 py-3.5 text-muted-foreground">
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
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Link
                        className="inline-flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                        href={`/admin/cursos/${course.id}`}
                      >
                        <Icon name="edit" size={16} />
                        Editar
                      </Link>
                      <form
                        action={setCoursePublished.bind(
                          null,
                          course.id,
                          !course.published,
                        )}
                      >
                        <button
                          className="inline-flex items-center gap-1 rounded-2xl px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          type="submit"
                        >
                          <Icon
                            name={course.published ? "visibility_off" : "publish"}
                            size={16}
                          />
                          {course.published ? "Despublicar" : "Publicar"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
