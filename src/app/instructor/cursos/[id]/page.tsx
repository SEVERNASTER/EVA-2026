import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AttendanceForm } from "@/components/teaching/attendance-form";
import { DeleteSessionButton } from "@/components/teaching/delete-session-button";
import { GradeForm } from "@/components/teaching/grade-form";
import { SessionForm } from "@/components/teaching/session-form";
import { requireRole } from "@/lib/auth/guards";
import type { Course } from "@/lib/courses/types";
import { categoryLabel, type Enrollment } from "@/lib/enrollments/types";
import { createClient } from "@/lib/supabase/server";
import {
  formatAttendance,
  formatSessionDate,
  type AttendanceRow,
  type Grade,
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

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("instructor_id", profile.id)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const [{ data: sessionData }, { data: enrollmentData }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("course_id", id)
      .order("session_date"),
    supabase
      .from("enrollments")
      .select("*, student:profiles!student_id(full_name)")
      .eq("course_id", id)
      .eq("status", "inscrito"),
  ]);

  const sessions = (sessionData ?? []) as Session[];
  const enrollments = ((enrollmentData ?? []) as Enrollment[]).sort((a, b) =>
    (a.student?.full_name ?? "").localeCompare(b.student?.full_name ?? ""),
  );
  const sessionIds = sessions.map((session) => session.id);
  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);

  const [{ data: attendanceData }, { data: gradeData }] = await Promise.all([
    sessionIds.length && enrollmentIds.length
      ? supabase
          .from("attendance")
          .select("session_id, enrollment_id, present")
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [] }),
    enrollmentIds.length
      ? supabase
          .from("grades")
          .select("*")
          .in("enrollment_id", enrollmentIds)
      : Promise.resolve({ data: [] }),
  ]);

  const attendance = (attendanceData ?? []) as AttendanceRow[];
  const grades = new Map(
    ((gradeData ?? []) as Grade[]).map((grade) => [
      grade.enrollment_id,
      Number(grade.score),
    ]),
  );

  const roster: RosterEntry[] = enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    name: enrollment.student?.full_name || "Participante",
    category: enrollment.category,
    present: attendance.filter(
      (row) => row.enrollment_id === enrollment.id && row.present,
    ).length,
    score: grades.get(enrollment.id) ?? null,
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
    <AppShell role="instructor" name={profile.full_name}>
      <Link
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        href="/instructor"
      >
        Volver
      </Link>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        {typedCourse.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {typedCourse.hours} h · {typedCourse.schedule} · Nota mínima{" "}
        {Number(typedCourse.nota_minima)} · Asistencia mínima{" "}
        {Number(typedCourse.asistencia_minima)} %
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-foreground">Sesiones</h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aún no hay sesiones registradas.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">Fecha</th>
                  <th className="py-2 pr-3 font-medium">Tema</th>
                  <th className="py-2 font-medium"> </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className={
                      session.id === selected?.id
                        ? "border-b border-border bg-muted"
                        : "border-b border-border"
                    }
                  >
                    <td className="py-3 pr-3 text-foreground">
                      {formatSessionDate(session.session_date)}
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">{session.topic}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-start justify-end gap-3">
                        <Link
                          className="text-foreground underline-offset-4 hover:underline"
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

      <section className="mt-12">
        <h2 className="text-sm font-medium text-foreground">
          Asistencia
          {selected
            ? ` · Sesión ${formatSessionDate(selected.session_date)}`
            : ""}
        </h2>
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

      <section className="mt-12">
        <h2 className="text-sm font-medium text-foreground">Inscritos y notas</h2>
        {roster.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            El curso no tiene participantes inscritos.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-medium">Participante</th>
                  <th className="py-2 pr-3 font-medium">Categoría</th>
                  <th className="py-2 pr-3 font-medium">Asistencia</th>
                  <th className="py-2 text-right font-medium">Nota (0–100)</th>
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
    </AppShell>
  );
}
