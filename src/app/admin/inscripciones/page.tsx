import { ConfirmEnrollmentButtons } from "@/components/confirm-enrollment-buttons";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { requireRole } from "@/lib/auth/guards";
import {
  categoryLabel,
  enrollmentStatusLabel,
  isScholarshipRequest,
  type Enrollment,
} from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEnrollmentsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      "*, course:courses(name), student:profiles!student_id(full_name)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Enrollment[];
  const pendingPay = rows.filter(
    (row) => row.status === "pendiente_pago" && row.category !== "beca",
  );
  const pendingAid = rows.filter(isScholarshipRequest);
  const confirmed = rows.filter((row) => row.status === "inscrito");
  const pendingTotal = pendingPay.reduce((sum, row) => sum + Number(row.amount), 0);
  const confirmedTotal = confirmed.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Inscripciones
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Caja registra el pago o confirma una solicitud de beca. El estudiante no
        queda inscrito hasta esa revisión.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon="payments"
          label="Pendiente de cobro"
          value={pendingTotal}
          hint={
            pendingPay.length === 1
              ? "1 preinscripción"
              : `${pendingPay.length} preinscripciones`
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

      <EnrollmentList
        title="Pendientes de pago"
        empty="No hay preinscripciones pendientes de cobro."
        rows={pendingPay}
        showActions
      />
      <EnrollmentList
        title="Solicitudes de beca"
        empty="No hay solicitudes de beca por revisar."
        rows={pendingAid}
        showActions
      />
      <EnrollmentList
        title="Inscritos"
        empty="Aún no hay participantes inscritos."
        rows={confirmed}
        showActions={false}
      />
    </>
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

function EnrollmentList({
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
        <ul className="grid gap-3">
          {rows.map((row) => {
            const scholarship = isScholarshipRequest(row);
            return (
              <li
                key={row.id}
                className="rounded-[1.4rem] border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {row.student?.full_name ?? "—"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.course?.name ?? "—"} · {categoryLabel(row.category)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {scholarship ? (
                        <span className="text-sm text-muted-foreground">Sin cobro si se confirma</span>
                      ) : (
                        <Money value={row.amount} />
                      )}
                      <Badge
                        tone={
                          row.status === "inscrito"
                            ? "success"
                            : scholarship
                              ? "warning"
                              : "warning"
                        }
                      >
                        {enrollmentStatusLabel(row.status, row.category)}
                      </Badge>
                      {!showActions ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Icon
                            name={row.settlement === "beca" ? "workspace_premium" : "point_of_sale"}
                            size={16}
                          />
                          {row.settlement === "beca" ? "Beca" : "Caja"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {showActions ? (
                    <ConfirmEnrollmentButtons
                      id={row.id}
                      studentName={row.student?.full_name ?? "Participante"}
                      courseName={row.course?.name ?? "el curso"}
                      amount={row.amount}
                      scholarshipRequest={scholarship}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
