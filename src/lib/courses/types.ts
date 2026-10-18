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
};

export function formatBs(value: number) {
  return `Bs ${Number(value).toLocaleString("es-BO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
