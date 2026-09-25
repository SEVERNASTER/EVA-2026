import { ConfirmEnrollmentButtons } from "@/components/confirm-enrollment-buttons";
import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";
import { formatBs } from "@/lib/courses/types";
import {
  categoryLabel,
  enrollmentStatusLabel,
  type Enrollment,
} from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEnrollmentsPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      "*, course:courses(name), student:profiles!student_id(full_name)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Enrollment[];
  const pending = rows.filter((row) => row.status === "pendiente_pago");
  const confirmed = rows.filter((row) => row.status === "inscrito");

  return (
    <AppShell role="admin" name={profile.full_name}>
      <h1 className="text-xl font-semibold tracking-tight text-white">
        Inscripciones
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        La preinscripción queda pendiente hasta registrar el pago en caja o
        aplicar una beca.
      </p>

      <EnrollmentTable
        title="Pendientes de pago"
        empty="No hay preinscripciones pendientes."
        rows={pending}
        showActions
      />
      <EnrollmentTable
        title="Inscritos"
        empty="Aún no hay participantes inscritos."
        rows={confirmed}
        showActions={false}
      />
    </AppShell>
  );
}

function EnrollmentTable({
  title,
  empty,
  rows,
  showActions,
}: {
  title: string;
  empty: string;
  rows: Enrollment[];
  showActions: boolean;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-medium text-zinc-300">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{empty}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-medium">Participante</th>
                <th className="py-2 pr-3 font-medium">Curso</th>
                <th className="py-2 pr-3 font-medium">Categoría</th>
                <th className="py-2 pr-3 font-medium">Importe</th>
                <th className="py-2 pr-3 font-medium">Estado</th>
                {showActions ? (
                  <th className="py-2 font-medium"> </th>
                ) : (
                  <th className="py-2 font-medium">Liquidación</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-line">
                  <td className="py-3 pr-3 text-zinc-100">
                    {row.student?.full_name ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-zinc-400">
                    {row.course?.name ?? "—"}
                  </td>
                  <td className="py-3 pr-3 text-zinc-400">
                    {categoryLabel(row.category)}
                  </td>
                  <td className="py-3 pr-3 text-zinc-400">
                    {formatBs(row.amount)}
                  </td>
                  <td className="py-3 pr-3 text-zinc-400">
                    {enrollmentStatusLabel(row.status)}
                  </td>
                  <td className="py-3 text-right">
                    {showActions ? (
                      <ConfirmEnrollmentButtons id={row.id} />
                    ) : (
                      <span className="text-zinc-400">
                        {row.settlement === "beca" ? "Beca" : "Caja"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
