import Link from "next/link";
import { AdminCourseTable } from "@/components/admin-course-table";
import { Icon } from "@/components/ui/icon";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles!instructor_id(full_name), course_schedule_slots(*)")
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];

  return (
    <>
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
      <AdminCourseTable courses={courses} />
    </>
  );
}
