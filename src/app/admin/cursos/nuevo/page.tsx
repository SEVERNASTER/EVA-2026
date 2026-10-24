import Link from "next/link";
import { CourseForm } from "@/components/course-form";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function NewCoursePage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: instructors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "instructor")
    .order("full_name");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href="/admin"
      >
        <Icon name="arrow_back" size={16} />
        Volver
      </Link>
      <div className="mt-4">
        <PageHeader
          icon="add_circle"
          eyebrow="Cursos"
          title="Nuevo curso"
          description="Completa los datos del curso. Los precios se muestran en bolivianos."
        />
      </div>
      <div className="mt-8">
        <CourseForm instructors={instructors ?? []} />
      </div>
    </div>
  );
}
