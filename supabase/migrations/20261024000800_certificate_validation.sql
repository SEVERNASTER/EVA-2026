-- HU-06 / Requisito: Aprobación y validación administrativa de certificados
alter table public.certificates
  add column if not exists is_validated boolean not null default false,
  add column if not exists status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  add column if not exists validated_at timestamptz,
  add column if not exists validated_by uuid references public.profiles(id);

create policy "certificates_update_admin"
  on public.certificates
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop function if exists public.certificate_by_code(text);

create or replace function public.certificate_by_code(p_code text)
returns table (
  code text,
  participant_name text,
  course_name text,
  hours integer,
  kind text,
  issued_at timestamptz,
  instructor_name text,
  is_validated boolean,
  status text,
  validated_at timestamptz
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
    coalesce(ip.full_name, 'Docente Titular') as instructor_name,
    c.is_validated,
    c.status,
    c.validated_at
  from public.certificates c
  left join public.enrollments e on e.id = c.enrollment_id
  left join public.courses cr on cr.id = e.course_id
  left join public.profiles ip on ip.id = cr.instructor_id
  where c.code = upper(trim(p_code));
$$;

grant execute on function public.certificate_by_code(text) to anon, authenticated;

create or replace function public.approve_certificate(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede aprobar certificados.'
      using errcode = 'P0001';
  end if;

  update public.certificates
  set
    is_validated = true,
    status = 'APPROVED',
    validated_at = now(),
    validated_by = auth.uid()
  where code = upper(trim(p_code));

  return found;
end;
$$;

grant execute on function public.approve_certificate(text) to authenticated;
