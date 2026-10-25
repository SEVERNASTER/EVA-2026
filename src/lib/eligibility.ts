import type { Course } from "@/lib/courses/types";
import { attendancePercent, type CourseProgress } from "@/lib/teaching/types";

export type EligibilityCriterion = "nota" | "asistencia";

export type Eligibility = {
  eligible: boolean;
  failed: { criterion: EligibilityCriterion; message: string }[];
};

/** Misma regla que public.enrollment_eligibility en la base. */
export function evaluateEligibility(
  progress: CourseProgress,
  course: Pick<Course, "nota_minima" | "asistencia_minima">,
): Eligibility {
  const notaMinima = Number(course.nota_minima);
  const asistenciaMinima = Number(course.asistencia_minima);
  const failed: Eligibility["failed"] = [];

  if (progress.score === null) {
    failed.push({ criterion: "nota", message: "Sin nota registrada" });
  } else if (progress.score < notaMinima) {
    failed.push({
      criterion: "nota",
      message: `Nota ${Number(progress.score)} bajo el mínimo de ${notaMinima}`,
    });
  }

  if (progress.total === 0) {
    failed.push({ criterion: "asistencia", message: "Sin sesiones registradas" });
  } else if (progress.present * 100 < asistenciaMinima * progress.total) {
    failed.push({
      criterion: "asistencia",
      message: `Asistencia ${attendancePercent(progress.present, progress.total)} % bajo el mínimo de ${asistenciaMinima} %`,
    });
  }

  return { eligible: failed.length === 0, failed };
}
