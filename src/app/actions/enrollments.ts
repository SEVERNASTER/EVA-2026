"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import {
  isParticipantCategory,
  type EnrollmentSettlement,
} from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";

function revalidateEnrollmentPaths() {
  revalidatePath("/estudiante");
  revalidatePath("/admin");
  revalidatePath("/admin/inscripciones");
  revalidatePath("/instructor");
}

export async function preenroll(formData: FormData) {
  const profile = await requireRole("estudiante");
  const courseId = String(formData.get("course_id") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!courseId || !isParticipantCategory(category)) {
    return { error: "Elige una categoría de participante." };
  }

  const supabase = await createClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, published")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError || !course || !course.published) {
    return { error: "El curso no está abierto a preinscripción." };
  }

  const { error } = await supabase.from("enrollments").insert({
    course_id: courseId,
    student_id: profile.id,
    category,
    amount: 0,
    status: "pendiente_pago",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya estás preinscrito en este curso." };
    }
    return { error: "No se pudo completar la preinscripción." };
  }

  revalidateEnrollmentPaths();
  return { ok: true as const };
}

export async function confirmEnrollment(
  id: string,
  settlement: EnrollmentSettlement,
) {
  const admin = await requireRole("admin");

  if (settlement !== "caja" && settlement !== "beca") {
    return { error: "Indica si el registro es pago en caja o beca." };
  }

  const supabase = await createClient();
  const { data: enrollment, error: loadError } = await supabase
    .from("enrollments")
    .select("id, status, amount")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !enrollment) {
    return { error: "No se encontró la preinscripción." };
  }
  if (enrollment.status !== "pendiente_pago") {
    return { error: "Esta inscripción ya está confirmada." };
  }

  const amount = settlement === "beca" ? 0 : enrollment.amount;

  const { error } = await supabase
    .from("enrollments")
    .update({
      status: "inscrito",
      settlement,
      amount,
      confirmed_at: new Date().toISOString(),
      confirmed_by: admin.id,
    })
    .eq("id", id)
    .eq("status", "pendiente_pago");

  if (error) {
    return { error: "No se pudo confirmar la inscripción." };
  }

  revalidateEnrollmentPaths();
  return { ok: true };
}

export async function rejectScholarship(id: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: enrollment, error: loadError } = await supabase
    .from("enrollments")
    .select("id, status, category, course_id")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !enrollment) {
    return { error: "No se encontró la solicitud." };
  }
  if (enrollment.status !== "pendiente_pago" || enrollment.category !== "beca") {
    return { error: "Esta fila no es una solicitud de beca pendiente." };
  }

  const { data: course } = await supabase
    .from("courses")
    .select("precio_regular")
    .eq("id", enrollment.course_id)
    .maybeSingle();

  const { error } = await supabase
    .from("enrollments")
    .update({
      category: "regular",
      amount: Number(course?.precio_regular ?? 0),
      confirmed_at: null,
      confirmed_by: null,
    })
    .eq("id", id)
    .eq("status", "pendiente_pago");

  if (error) {
    return { error: "No se pudo pasar la solicitud a pago regular." };
  }

  revalidateEnrollmentPaths();
  return { ok: true };
}
