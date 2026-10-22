import { ConfirmEnrollmentButtons } from "@/components/confirm-enrollment-buttons";
import { EligibilityStatus } from "@/components/eligibility-status";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { requireRole } from "@/lib/auth/guards";
import { evaluateEligibility, type Eligibility } from "@/lib/eligibility";
import {
  categoryLabel,
  enrollmentStatusLabel,
  isScholarshipRequest,
  type Enrollment,
} from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";
import {
  embeddedOne,
  embeddedPresent,
  embeddedScore,
  ENROLLMENT_TEACHING_SELECT,
  type EnrollmentTeachingEmbed,
} from "@/lib/teaching/types";

type AdminEnrollment = Enrollment &
  EnrollmentTeachingEmbed & {
    course?: {
      name: string;
      nota_minima: number;
      asistencia_minima: number;
      sessions?: { count: number }[];
    } | null;
    certificates?: { code: string } | { code: string }[] | null;
  };

type Outcome = { eligibility: Eligibility; certificateCode: string | null };

export default async function AdminEnrollmentsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      `*, course:courses(name, nota_minima, asistencia_minima, sessions(count)), student:profiles!student_id(full_name), ${ENROLLMENT_TEACHING_SELECT}, certificates(code)`,
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as AdminEnrollment[];
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
  const outcomes = buildOutcomes(confirmed);

  return (
    <>
      <PageHeader
        icon="how_to_reg"
        eyebrow="Caja"
        title="Inscripciones"
        description="Caja registra el pago o confirma una solicitud de beca. El estudiante no queda inscrito hasta esa revisión."
      />

      <StatGrid>
        <StatCard
          icon="payments"
          label="Pendiente de cobro"
          value={<Money value={pendingTotal} />}
          hint={plural(pendingPay.length, "preinscripción", "preinscripciones")}
          tone="warning"
        />
        <StatCard
          icon="workspace_premium"
          label="Solicitudes de beca"
          value={pendingAid.length}
          hint="Por revisar"
          tone="primary"
        />
        <StatCard
          icon="account_balance_wallet"
          label="Inscrito / liquidado"
          value={<Money value={confirmedTotal} />}
          hint={plural(confirmed.length, "participante", "participantes")}
          tone="success"
        />
      </StatGrid>

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
        outcomes={outcomes}
      />
    </>
  );
}

/** Elegibilidad desde los datos embebidos en la consulta de inscripciones. */
function buildOutcomes(confirmed: AdminEnrollment[]) {
  const outcomes = new Map<string, Outcome>();
  for (const row of confirmed) {
    if (!row.course) continue;
    const progress = {
      total: row.course.sessions?.[0]?.count ?? 0,
      present: embeddedPresent(row),
      score: embeddedScore(row),
    };
    outcomes.set(row.id, {
      eligibility: evaluateEligibility(progress, row.course),
      certificateCode: embeddedOne(row.certificates)?.code ?? null,
    });
  }
  return outcomes;
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function EnrollmentList({
  title,
  empty,
  rows,
  showActions,
  outcomes,
}: {
  title: string;
  empty: string;
  rows: AdminEnrollment[];
  showActions: boolean;
  outcomes?: Map<string, Outcome>;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
          {rows.length}
        </span>
      </h2>
      {rows.length === 0 ? (
        <EmptyState icon="task_alt" title={empty} />
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const scholarship = isScholarshipRequest(row);
            const outcome = outcomes?.get(row.id);
            return (
              <li
                key={row.id}
                className="card-lift rounded-[1.4rem] border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-soft-foreground sm:flex">
                      {(row.student?.full_name ?? "?").trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
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
                              ? "info"
                              : "warning"
                        }
                        dot
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
                    {outcome ? (
                      <div className="mt-3">
                        <EligibilityStatus
                          eligibility={outcome.eligibility}
                          enrollmentId={row.id}
                          certificateCode={outcome.certificateCode}
                          canIssue
                        />
                      </div>
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
