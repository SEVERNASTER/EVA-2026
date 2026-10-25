import type { ParticipantCategory } from "@/lib/enrollments/types";

export type Session = {
  id: string;
  course_id: string;
  session_date: string;
  topic: string;
  created_at: string;
};

export type AttendanceRow = {
  session_id: string;
  enrollment_id: string;
  present: boolean;
};

export type Grade = {
  enrollment_id: string;
  score: number;
  graded_by: string;
  updated_at: string;
};

export type RosterEntry = {
  enrollmentId: string;
  name: string;
  category: ParticipantCategory;
  present: number;
  score: number | null;
};

export type CourseProgress = {
  present: number;
  total: number;
  score: number | null;
};

/** Asistencia y nota embebidas en la consulta de inscripciones (una sola ida a la base). */
export type EnrollmentTeachingEmbed = {
  attendance?: { session_id: string; present: boolean }[] | null;
  grades?: { score: number } | { score: number }[] | null;
};

export const ENROLLMENT_TEACHING_SELECT =
  "attendance(session_id, present), grades(score)";

/** PostgREST devuelve una relación 1:1 como objeto o como arreglo según la versión. */
export function embeddedOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function embeddedScore(row: EnrollmentTeachingEmbed) {
  const grade = embeddedOne(row.grades);
  return grade ? Number(grade.score) : null;
}

export function embeddedPresent(row: EnrollmentTeachingEmbed, validSessionIds?: Set<string>) {
  return (row.attendance ?? []).filter((entry) => entry.present && (!validSessionIds || validSessionIds.has(entry.session_id))).length;
}

export function attendancePercent(present: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((present / total) * 100);
}

export function formatAttendance(present: number, total: number) {
  if (total === 0) {
    return "Sin sesiones";
  }
  return `${present}/${total} · ${attendancePercent(present, total)} %`;
}

export function formatScore(score: number | null) {
  return score === null ? "Sin nota" : String(Number(score));
}

export function formatSessionDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
