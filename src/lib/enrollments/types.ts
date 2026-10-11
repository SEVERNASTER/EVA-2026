import { formatBs } from "@/lib/courses/types";

export const PARTICIPANT_CATEGORIES = [
  "regular",
  "auxiliar_ad_honorem",
  "beca",
] as const;

export type ParticipantCategory = (typeof PARTICIPANT_CATEGORIES)[number];

export const ENROLLMENT_STATUSES = ["pendiente_pago", "inscrito"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const ENROLLMENT_SETTLEMENTS = ["caja", "beca"] as const;
export type EnrollmentSettlement = (typeof ENROLLMENT_SETTLEMENTS)[number];

export type Enrollment = {
  id: string;
  course_id: string;
  student_id: string;
  category: ParticipantCategory;
  amount: number;
  status: EnrollmentStatus;
  settlement: EnrollmentSettlement | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
  course?: { name: string } | null;
  student?: { full_name: string } | null;
};

export function isParticipantCategory(
  value: string,
): value is ParticipantCategory {
  return PARTICIPANT_CATEGORIES.includes(value as ParticipantCategory);
}

export function categoryLabel(category: ParticipantCategory) {
  switch (category) {
    case "regular":
      return "Regular";
    case "auxiliar_ad_honorem":
      return "Auxiliar ad-honorem";
    case "beca":
      return "Beca";
  }
}

export function enrollmentStatusLabel(status: EnrollmentStatus) {
  return status === "inscrito" ? "Inscrito" : "Pendiente de pago";
}

export function amountForCategory(
  category: ParticipantCategory,
  precioRegular: number,
  precioAuxiliar: number,
) {
  switch (category) {
    case "regular":
      return precioRegular;
    case "auxiliar_ad_honorem":
      return precioAuxiliar;
    case "beca":
      return 0;
  }
}

export function formatEnrollmentAmount(amount: number) {
  return formatBs(amount);
}
