drop function if exists public.certificate_by_code(text);

create or replace function public.certificate_by_code(p_code text)
returns table (
  code text,
  participant_name text,
  course_name text,
  hours integer,
  kind text,
  issued_at timestamptz,
  instructor_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.code,
    c.participant_name,
    c.course_name,
    c.hours,
    c.kind,
    c.issued_at,
    coalesce(ip.full_name, 'Docente Titular') as instructor_name
  from public.certificates c
  left join public.enrollments e on e.id = c.enrollment_id
  left join public.courses cr on cr.id = e.course_id
  left join public.profiles ip on ip.id = cr.instructor_id
  where c.code = upper(trim(p_code));
$$;

grant execute on function public.certificate_by_code(text) to anon, authenticated;

