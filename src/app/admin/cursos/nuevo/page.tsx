import Link from "next/link";
import { CourseForm } from "@/components/course-form";
import { Icon } from "@/components/ui/icon";
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
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        href="/admin"
      >
        <Icon name="arrow_back" size={16} />
        Volver
      </Link>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Nuevo curso
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Completa los datos del curso. Los precios se muestran en bolivianos.
      </p>
      <div className="mt-6">
        <CourseForm instructors={instructors ?? []} />
      </div>
    </div>
  );
}
