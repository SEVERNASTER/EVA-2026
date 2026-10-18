import {
  formatScheduleSummary,
  type ScheduleSlot,
} from "@/lib/courses/schedule";

export type { ScheduleSlot };

export type Course = {
  id: string;
  name: string;
  content: string;
  hours: number;
  schedule: string;
  instructor_id: string;
  published: boolean;
  nota_minima: number;
  asistencia_minima: number;
  precio_regular: number;
  precio_auxiliar: number;
  created_at: string;
  instructor?: { full_name: string } | null;
  course_schedule_slots?: ScheduleSlot[];
};

export function courseScheduleLabel(course: Course) {
  return formatScheduleSummary(course.course_schedule_slots ?? [], course.schedule);
}

export function formatBs(value: number) {
  const amount = Number(value);
  const negative = amount < 0;
  const [integer, fraction] = Math.abs(amount).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const digits = fraction === "00" ? grouped : `${grouped},${fraction}`;
  return `Bs ${negative ? "-" : ""}${digits}`;
}
