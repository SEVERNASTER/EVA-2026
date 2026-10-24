-- HU-05: elegibilidad calculada en la base, misma regla que src/lib/eligibility.ts.
-- Apto si la nota >= nota_minima y la asistencia (presentes / sesiones) >= asistencia_minima.
create or replace function public.enrollment_eligibility(p_enrollment_id uuid)
returns table (
  enrollment_id uuid,
  present integer,
  total integer,
  score numeric,
  nota_minima numeric,
  asistencia_minima numeric,
  meets_grade boolean,
  meets_attendance boolean,
  eligible boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      e.id,
      c.nota_minima,
      c.asistencia_minima,
      (
        select count(*)::integer
        from public.sessions s
        where s.course_id = e.course_id
      ) as total,
      (
        select count(*)::integer
        from public.attendance a
        where a.enrollment_id = e.id
          and a.present
      ) as present,
      (
        select g.score
        from public.grades g
        where g.enrollment_id = e.id
      ) as score
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.id = p_enrollment_id
      and e.status = 'inscrito'
      and (
        e.student_id = auth.uid()
        or public.can_teach_course(e.course_id)
      )
  )
  select
    b.id,
    b.present,
    b.total,
    b.score,
    b.nota_minima,
    b.asistencia_minima,
    coalesce(b.score >= b.nota_minima, false),
    b.total > 0 and b.present * 100 >= b.asistencia_minima * b.total,
    coalesce(b.score >= b.nota_minima, false)
      and b.total > 0
      and b.present * 100 >= b.asistencia_minima * b.total
  from base b;
$$;

-- HU-06: certificado con datos congelados al emitir.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete restrict,
  code text not null unique check (code ~ '^[0-9A-F]{8}$'),
  participant_name text not null,
  course_name text not null,
  hours integer not null check (hours > 0),
  kind text not null default 'Aprobación',
  score numeric(5, 2) not null,
  issued_at timestamptz not null default now(),
  issued_by uuid not null references public.profiles (id) on delete restrict
);

alter table public.certificates enable row level security;

create policy "certificates_select_visible"
  on public.certificates
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.enrollments e
      where e.id = certificates.enrollment_id
        and e.student_id = auth.uid()
    )
  );

-- Sin políticas de escritura: solo se emite con issue_certificate.

create or replace function public.issue_certificate(p_enrollment_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing text;
  v_elig record;
  v_enrollment record;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Inicia sesión para emitir el certificado.'
      using errcode = 'P0001';
  end if;

  select e.student_id, c.name as course_name, c.hours, p.full_name
  into v_enrollment
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  join public.profiles p on p.id = e.student_id
  where e.id = p_enrollment_id;

  if not found
    or (v_enrollment.student_id <> auth.uid() and not public.is_admin()) then
    raise exception 'No se encontró la inscripción.'
      using errcode = 'P0001';
  end if;

  select code into v_existing
  from public.certificates
  where enrollment_id = p_enrollment_id;

  if v_existing is not null then
    return v_existing;
  end if;

  select * into v_elig
  from public.enrollment_eligibility(p_enrollment_id);

  if not found or not v_elig.eligible then
    raise exception 'El participante no cumple los criterios de aprobación.'
      using errcode = 'P0001';
  end if;

  loop
    v_code := upper(substr(md5(gen_random_uuid()::text), 1, 8));
    exit when not exists (
      select 1 from public.certificates where code = v_code
    );
  end loop;

  insert into public.certificates (
    enrollment_id,
    code,
    participant_name,
    course_name,
    hours,
    score,
    issued_by
  )
  values (
    p_enrollment_id,
    v_code,
    coalesce(nullif(v_enrollment.full_name, ''), 'Participante'),
    v_enrollment.course_name,
    v_enrollment.hours,
    v_elig.score,
    auth.uid()
  );

  return v_code;
end;
$$;

-- Verificación pública: solo por código exacto, sin listar certificados.
create or replace function public.certificate_by_code(p_code text)
returns table (
  code text,
  participant_name text,
  course_name text,
  hours integer,
  kind text,
  issued_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.code, c.participant_name, c.course_name, c.hours, c.kind, c.issued_at
  from public.certificates c
  where c.code = upper(trim(p_code));
$$;

grant execute on function public.enrollment_eligibility(uuid) to authenticated;
grant execute on function public.issue_certificate(uuid) to authenticated;
grant execute on function public.certificate_by_code(text) to anon, authenticated;
