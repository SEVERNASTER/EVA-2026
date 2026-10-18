"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import {
  formatScheduleSummary,
  type ScheduleSlot,
} from "@/lib/courses/schedule";
import { createClient } from "@/lib/supabase/server";

function num(formData: FormData, key: string) {
  return Number(String(formData.get(key) ?? "").replace(",", "."));
}

function parseSlots(formData: FormData): { slots?: ScheduleSlot[]; error?: string } {
  const weekdays = formData.getAll("slot_weekday").map((value) => Number(value));
  const starts = formData.getAll("slot_starts").map((value) => String(value));
  const ends = formData.getAll("slot_ends").map((value) => String(value).trim());

  if (weekdays.length === 0) {
    return { error: "Agrega al menos un horario semanal." };
  }

  const slots: ScheduleSlot[] = [];
  for (let index = 0; index < weekdays.length; index += 1) {
    const weekday = weekdays[index];
    const startsAt = starts[index];
    const endsAt = ends[index] || null;
    if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7 || !startsAt) {
      return { error: "Revisa día y hora de cada horario." };
    }
    if (endsAt && endsAt <= startsAt) {
      return { error: "La hora de fin debe ser posterior al inicio." };
    }
    slots.push({ weekday, starts_at: startsAt, ends_at: endsAt });
  }
  slots.sort(
    (a, b) => a.weekday - b.weekday || a.starts_at.localeCompare(b.starts_at),
  );
  return { slots };
}

function parseCourse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const instructorId = String(formData.get("instructor_id") ?? "").trim();
  const hours = num(formData, "hours");
  const notaMinima = num(formData, "nota_minima");
  const asistenciaMinima = num(formData, "asistencia_minima");
  const precioRegular = num(formData, "precio_regular");
  const precioAuxiliar = num(formData, "precio_auxiliar");
  const published = formData.get("published") === "on";
  const parsedSlots = parseSlots(formData);

  if (!name || !content || !instructorId) {
    return { error: "Completa nombre, contenido e instructor." };
  }
  if (parsedSlots.error || !parsedSlots.slots) {
    return { error: parsedSlots.error ?? "Agrega al menos un horario semanal." };
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
      schedule: formatScheduleSummary(parsedSlots.slots),
      instructor_id: instructorId,
      hours: Math.round(hours),
      nota_minima: notaMinima,
      asistencia_minima: asistenciaMinima,
      precio_regular: precioRegular,
      precio_auxiliar: precioAuxiliar,
      published,
    },
    slots: parsedSlots.slots,
  };
}

async function replaceSlots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  slots: ScheduleSlot[],
) {
  const { error: removeError } = await supabase
    .from("course_schedule_slots")
    .delete()
    .eq("course_id", courseId);
  if (removeError) return removeError;

  const { error: insertError } = await supabase.from("course_schedule_slots").insert(
    slots.map((slot, index) => ({
      course_id: courseId,
      weekday: slot.weekday,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      sort_order: index,
    })),
  );
  return insertError;
}

export async function createCourse(formData: FormData) {
  await requireRole("admin");
  const parsed = parseCourse(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert(parsed.payload)
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear el curso. Revisa el instructor y los datos." };
  }

  const slotError = await replaceSlots(supabase, data.id, parsed.slots);
  if (slotError) {
    return { error: "El curso se creó, pero no se pudieron guardar los horarios." };
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

  const slotError = await replaceSlots(supabase, id, parsed.slots);
  if (slotError) {
    return { error: "No se pudieron guardar los horarios." };
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
