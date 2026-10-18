"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string) {
  return Number(String(formData.get(key) ?? "").replace(",", "."));
}

function parseCourse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const schedule = String(formData.get("schedule") ?? "").trim();
  const instructorId = String(formData.get("instructor_id") ?? "").trim();
  const hours = num(formData, "hours");
  const notaMinima = num(formData, "nota_minima");
  const asistenciaMinima = num(formData, "asistencia_minima");
  const precioRegular = num(formData, "precio_regular");
  const precioAuxiliar = num(formData, "precio_auxiliar");
  const published = formData.get("published") === "on";

  if (!name || !content || !schedule || !instructorId) {
    return { error: "Completa nombre, contenido, horario e instructor." };
  }
  if (!Number.isFinite(hours) || hours < 1) {
    return { error: "Las horas deben ser un entero mayor a 0." };
  }
  if (!Number.isFinite(notaMinima) || notaMinima < 0 || notaMinima > 100) {
    return { error: "La nota mínima debe estar entre 0 y 100." };
  }
  if (
    !Number.isFinite(asistenciaMinima) ||
    asistenciaMinima < 0 ||
    asistenciaMinima > 100
  ) {
    return { error: "La asistencia mínima debe estar entre 0 y 100." };
  }
  if (!Number.isFinite(precioRegular) || precioRegular < 0) {
    return { error: "El precio regular no puede ser negativo." };
  }
  if (!Number.isFinite(precioAuxiliar) || precioAuxiliar < 0) {
    return { error: "El precio de auxiliar ad-honorem no puede ser negativo." };
  }

  return {
    payload: {
      name,
      content,
      schedule,
      instructor_id: instructorId,
      hours: Math.round(hours),
      nota_minima: notaMinima,
      asistencia_minima: asistenciaMinima,
      precio_regular: precioRegular,
      precio_auxiliar: precioAuxiliar,
      published,
    },
  };
}

export async function createCourse(formData: FormData) {
  await requireRole("admin");
  const parsed = parseCourse(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert(parsed.payload);

  if (error) {
    return { error: "No se pudo crear el curso. Revisa el instructor y los datos." };
  }

  revalidatePath("/admin");
  revalidatePath("/estudiante");
  revalidatePath("/instructor");
  redirect("/admin");
}

export async function updateCourse(id: string, formData: FormData) {
  await requireRole("admin");
  const parsed = parseCourse(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update(parsed.payload)
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar el curso." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/cursos/${id}`);
  revalidatePath("/estudiante");
  revalidatePath("/instructor");
  redirect("/admin");
}

export async function setCoursePublished(id: string, published: boolean) {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ published })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo cambiar la publicación." };
  }

  revalidatePath("/admin");
  revalidatePath("/estudiante");
  revalidatePath("/instructor");
  return { ok: true };
}
