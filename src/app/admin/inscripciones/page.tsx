import { ConfirmEnrollmentButtons } from "@/components/confirm-enrollment-buttons";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { requireRole } from "@/lib/auth/guards";
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
  const pendingTotal = pending.reduce((sum, row) => sum + Number(row.amount), 0);
  const confirmedTotal = confirmed.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );

  return (
    <AppShell role="admin" name={profile.full_name}>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Inscripciones
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La preinscripción queda pendiente hasta registrar el pago en caja o
        aplicar una beca.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon="payments"
          label="Pendiente de cobro"
          value={pendingTotal}
          hint={
            pending.length === 1
              ? "1 preinscripción"
              : `${pending.length} preinscripciones`
          }
        />
        <SummaryCard
          icon="account_balance_wallet"
          label="Inscrito / liquidado"
          value={confirmedTotal}
          hint={
            confirmed.length === 1
              ? "1 participante"
              : `${confirmed.length} participantes`
          }
        />
      </div>

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

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-card p-5 shadow-sm">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name={icon} size={18} />
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        <Money value={value} />
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
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
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-[1.4rem] border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/70 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Participante</th>
                  <th className="px-3 py-3 font-medium">Curso</th>
                  <th className="px-3 py-3 font-medium">Categoría</th>
                  <th className="px-3 py-3 font-medium">Importe</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">
                    {showActions ? " " : "Liquidación"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border hover:bg-muted/40"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {row.student?.full_name ?? "—"}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {row.course?.name ?? "—"}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {categoryLabel(row.category)}
                    </td>
                    <td className="px-3 py-3.5">
                      <Money value={row.amount} />
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge tone={row.status === "inscrito" ? "success" : "warning"}>
                        {enrollmentStatusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {showActions ? (
                        <ConfirmEnrollmentButtons id={row.id} />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Icon
                            name={row.settlement === "beca" ? "workspace_premium" : "point_of_sale"}
                            size={16}
                          />
                          {row.settlement === "beca" ? "Beca" : "Caja"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
