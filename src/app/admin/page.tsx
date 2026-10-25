import Link from "next/link";
import { AdminCourseTable } from "@/components/admin-course-table";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
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

  const published = courses.filter((course) => course.published).length;
  const totalHours = courses.reduce((sum, course) => sum + course.hours, 0);

  return (
    <>
      <PageHeader
        icon="menu_book"
        eyebrow="Administración"
        title="Cursos"
        description="Crea la oferta, define los criterios de aprobación y publica lo que los estudiantes pueden ver."
        actions={
          <Link
            className="auth-submit inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
            href="/admin/cursos/nuevo"
          >
            <Icon name="add" size={18} />
            Nuevo curso
          </Link>
        }
      />
      <StatGrid>
        <StatCard icon="library_books" label="En el catálogo" value={courses.length} hint="Cursos registrados" />
        <StatCard
          icon="public"
          label="Publicados"
          value={published}
          hint={`${courses.length - published} en borrador`}
          tone="success"
        />
        <StatCard icon="schedule" label="Horas ofertadas" value={`${totalHours} h`} hint="Suma de todos los cursos" tone="gold" />
      </StatGrid>
      <AdminCourseTable courses={courses} />
    </>
  );
}
