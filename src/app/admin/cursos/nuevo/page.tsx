import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CourseForm } from "@/components/course-form";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function NewCoursePage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const { data: instructors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "instructor")
    .order("full_name");

  return (
    <AppShell role="admin" name={profile.full_name}>
      <Link
        className="text-sm text-zinc-500 hover:text-white"
        href="/admin"
      >
        Volver
      </Link>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-white">
        Nuevo curso
      </h1>
      <div className="mt-8">
        <CourseForm instructors={instructors ?? []} />
      </div>
    </AppShell>
  );
}
