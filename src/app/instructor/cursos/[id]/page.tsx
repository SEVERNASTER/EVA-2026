import Link from "next/link";
import { notFound } from "next/navigation";
import { AttendanceForm } from "@/components/teaching/attendance-form";
import { DeleteSessionButton } from "@/components/teaching/delete-session-button";
import { GradeForm } from "@/components/teaching/grade-form";
import { SessionForm } from "@/components/teaching/session-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/lib/auth/guards";
import { courseScheduleLabel, type Course } from "@/lib/courses/types";
import { categoryLabel, type Enrollment } from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";
import {
  embeddedPresent,
  embeddedScore,
  ENROLLMENT_TEACHING_SELECT,
  formatAttendance,
  formatSessionDate,
  type AttendanceRow,
  type EnrollmentTeachingEmbed,
  type RosterEntry,
  type Session,
} from "@/lib/teaching/types";

export default async function InstructorCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await requireRole("instructor");
  const supabase = await createClient();

  // Una sola tanda: curso, sesiones e inscritos con su asistencia y nota embebidas.
  const [{ data: course }, { data: sessionData }, { data: enrollmentData }] =
    await Promise.all([
      supabase
        .from("courses")
        .select("*, course_schedule_slots(*)")
        .eq("id", id)
        .eq("instructor_id", profile.id)
        .maybeSingle(),
      supabase
        .from("sessions")
        .select("*")
        .eq("course_id", id)
        .order("session_date"),
      supabase
        .from("enrollments")
        .select(`*, student:profiles!student_id(full_name), ${ENROLLMENT_TEACHING_SELECT}`)
        .eq("course_id", id)
        .eq("status", "inscrito"),
    ]);

  if (!course) {
    notFound();
  }

  const sessions = (sessionData ?? []) as Session[];
  const enrollments = (
    (enrollmentData ?? []) as (Enrollment & EnrollmentTeachingEmbed)[]
  ).sort((a, b) =>
    (a.student?.full_name ?? "").localeCompare(b.student?.full_name ?? ""),
  );

  const attendance: AttendanceRow[] = enrollments.flatMap((enrollment) =>
    (enrollment.attendance ?? []).map((row) => ({
      session_id: row.session_id,
      enrollment_id: enrollment.id,
      present: row.present,
    })),
  );

  const roster: RosterEntry[] = enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    name: enrollment.student?.full_name || "Participante",
    category: enrollment.category,
    present: embeddedPresent(enrollment),
    score: embeddedScore(enrollment),
  }));

  const requested =
    typeof query.sesion === "string" ? query.sesion : undefined;
  const selected =
    sessions.find((session) => session.id === requested) ?? sessions.at(-1);
  const presentInSelected = new Set(
    attendance
      .filter((row) => row.session_id === selected?.id && row.present)
      .map((row) => row.enrollment_id),
  );

  const typedCourse = course as Course;

  return (
    <>
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        href="/instructor"
      >
        <Icon name="arrow_back" size={16} />
        Volver
      </Link>
      <div className="mt-4">
        <PageHeader
          icon="co_present"
          eyebrow="Gestión del curso"
          title={typedCourse.name}
          description={`${typedCourse.hours} h · ${courseScheduleLabel(typedCourse)}`}
        />
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        {[
          { icon: "event", text: `${sessions.length} sesiones` },
          { icon: "group", text: `${roster.length} inscritos` },
          { icon: "grade", text: `Nota mínima ${Number(typedCourse.nota_minima)}` },
          { icon: "fact_check", text: `Asistencia mínima ${Number(typedCourse.asistencia_minima)} %` },
        ].map((item) => (
          <span
            key={item.text}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-medium text-foreground"
          >
            <Icon name={item.icon} size={16} className="text-primary-soft-foreground" />
            {item.text}
          </span>
        ))}
      </div>

      <section className="mt-10 rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-6">
        <SectionTitle icon="event" title="Sesiones" />
        {sessions.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon="event_busy" title="Aún no hay sesiones registradas" />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Fecha</th>
                  <th className="py-2 pr-3 font-semibold">Tema</th>
                  <th className="py-2 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className={
                      session.id === selected?.id
                        ? "border-b border-border bg-primary-soft/60"
                        : "border-b border-border hover:bg-muted/50"
                    }
                  >
                    <td className="py-3 pr-3 text-foreground">
                      {formatSessionDate(session.session_date)}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{session.topic}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-start justify-end gap-3">
                        <Link
                          className="font-medium text-primary-soft-foreground underline-offset-4 hover:underline"
                          href={`/instructor/cursos/${id}?sesion=${session.id}`}
                          scroll={false}
                        >
                          Asistencia
                        </Link>
                        <DeleteSessionButton courseId={id} sessionId={session.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SessionForm courseId={id} />
      </section>

      <section className="mt-6 rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-6">
        <SectionTitle
          icon="fact_check"
          title={`Asistencia${selected ? ` · Sesión ${formatSessionDate(selected.session_date)}` : ""}`}
        />
        {!selected ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Agrega una sesión para registrar la asistencia.
          </p>
        ) : roster.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            El curso no tiene participantes inscritos.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">{selected.topic}</p>
            <AttendanceForm
              key={selected.id}
              courseId={id}
              sessionId={selected.id}
              entries={roster.map((entry) => ({
                enrollmentId: entry.enrollmentId,
                name: entry.name,
                present: presentInSelected.has(entry.enrollmentId),
              }))}
            />
          </>
        )}
      </section>

      <section className="mt-6 rounded-[1.4rem] border border-border bg-card p-5 shadow-sm md:p-6">
        <SectionTitle icon="grade" title="Inscritos y notas" />
        {roster.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            El curso no tiene participantes inscritos.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Participante</th>
                  <th className="py-2 pr-3 font-semibold">Categoría</th>
                  <th className="py-2 pr-3 font-semibold">Asistencia</th>
                  <th className="py-2 text-right font-semibold">Nota (0–100)</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((entry) => (
                  <tr key={entry.enrollmentId} className="border-b border-border">
                    <td className="py-3 pr-3 text-foreground">{entry.name}</td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {categoryLabel(entry.category)}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {formatAttendance(entry.present, sessions.length)}
                    </td>
                    <td className="py-3">
                      <GradeForm
                        courseId={id}
                        enrollmentId={entry.enrollmentId}
                        score={entry.score}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
        <Icon name={icon} size={18} />
      </span>
      {title}
    </h2>
  );
}
