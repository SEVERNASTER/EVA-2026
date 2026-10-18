import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CourseForm } from "@/components/course-form";
import { Icon } from "@/components/ui/icon";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { createClient } from "@/lib/supabase/server";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const [{ data: course }, { data: instructors }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "instructor")
      .order("full_name"),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <AppShell role="admin" name={profile.full_name}>
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        href="/admin"
      >
        <Icon name="arrow_back" size={16} />
        Volver
      </Link>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        Editar curso
      </h1>
      <div className="mt-6">
        <CourseForm
          course={course as Course}
          instructors={instructors ?? []}
        />
      </div>
    </AppShell>
  );
}
