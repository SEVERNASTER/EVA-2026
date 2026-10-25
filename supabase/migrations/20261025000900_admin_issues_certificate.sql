-- Solo el admin emite. Un clic deja el certificado oficial (APPROVED).
-- enrollment_eligibility también debe responderle al admin.

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
        or public.is_admin()
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

create or replace function public.issue_certificate(p_enrollment_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.certificates%rowtype;
  v_elig record;
  v_enrollment record;
  v_code text;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Solo el administrador emite el certificado.'
      using errcode = 'P0001';
  end if;

  select e.student_id, c.name as course_name, c.hours, p.full_name
  into v_enrollment
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  join public.profiles p on p.id = e.student_id
  where e.id = p_enrollment_id
    and e.status = 'inscrito';

  if not found then
    raise exception 'No se encontró la inscripción.'
      using errcode = 'P0001';
  end if;

  select * into v_existing
  from public.certificates
  where enrollment_id = p_enrollment_id;

  if found then
    if not v_existing.is_validated or v_existing.status is distinct from 'APPROVED' then
      update public.certificates
      set
        is_validated = true,
        status = 'APPROVED',
        validated_at = coalesce(validated_at, now()),
        validated_by = coalesce(validated_by, auth.uid())
      where id = v_existing.id;
    end if;
    return v_existing.code;
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
    issued_by,
    is_validated,
    status,
    validated_at,
    validated_by
  )
  values (
    p_enrollment_id,
    v_code,
    coalesce(nullif(v_enrollment.full_name, ''), 'Participante'),
    v_enrollment.course_name,
    v_enrollment.hours,
    v_elig.score,
    auth.uid(),
    true,
    'APPROVED',
    now(),
    auth.uid()
  );

  return v_code;
end;
$$;
