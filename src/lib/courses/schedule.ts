export const WEEKDAYS = [
  { value: 1, short: "Lun", label: "Lunes" },
  { value: 2, short: "Mar", label: "Martes" },
  { value: 3, short: "Mié", label: "Miércoles" },
  { value: 4, short: "Jue", label: "Jueves" },
  { value: 5, short: "Vie", label: "Viernes" },
  { value: 6, short: "Sáb", label: "Sábado" },
  { value: 7, short: "Dom", label: "Domingo" },
] as const;

export type ScheduleSlot = {
  id?: string;
  weekday: number;
  starts_at: string;
  ends_at: string | null;
};

function timeLabel(value: string) {
  return value.slice(0, 5);
}

export function formatSlot(slot: ScheduleSlot) {
  const day = WEEKDAYS.find((item) => item.value === slot.weekday)?.short ?? "";
  const start = timeLabel(slot.starts_at);
  if (!slot.ends_at) return `${day} ${start}`;
  return `${day} ${start}–${timeLabel(slot.ends_at)}`;
}

export function formatScheduleSummary(slots: ScheduleSlot[], fallback = "") {
  if (slots.length === 0) return fallback;
  return slots.map(formatSlot).join(" · ");
}

export function emptySlot(): ScheduleSlot {
  return { weekday: 1, starts_at: "18:30", ends_at: "21:00" };
}
