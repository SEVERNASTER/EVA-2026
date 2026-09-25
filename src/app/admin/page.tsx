import Link from "next/link";
import { setCoursePublished } from "@/app/actions/courses";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";
import { formatBs, type Course } from "@/lib/courses/types";
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Cursos
        </h1>
        <Link
          className="auth-submit inline-flex h-9 items-center rounded-md bg-white px-3 text-sm font-medium text-black"
          href="/admin/cursos/nuevo"
        >
          Nuevo curso
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Horas</th>
              <th className="py-2 pr-3 font-medium">Precio</th>
              <th className="py-2 pr-3 font-medium">Estado</th>
              <th className="py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-line">
                <td className="py-3 pr-3 text-zinc-100">{course.name}</td>
                <td className="py-3 pr-3 text-zinc-400">{course.hours}</td>
                <td className="py-3 pr-3 text-zinc-400">
                  {formatBs(course.precio_regular)}
                </td>
                <td className="py-3 pr-3 text-zinc-400">
                  {course.published ? "Publicado" : "Borrador"}
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      className="text-zinc-300 underline-offset-4 hover:underline"
                      href={`/admin/cursos/${course.id}`}
                    >
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
                        className="text-zinc-400 hover:text-white"
                        type="submit"
                      >
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
    </AppShell>
  );
}
