create type public.participant_category as enum (
  'regular',
  'auxiliar_ad_honorem',
  'beca'
);

create type public.enrollment_status as enum (
  'pendiente_pago',
  'inscrito'
);

create type public.enrollment_settlement as enum (
  'caja',
  'beca'
);

alter table public.courses
  add column precio_auxiliar numeric(10, 2) not null default 0
    check (precio_auxiliar >= 0);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete restrict,
  student_id uuid not null references public.profiles (id) on delete restrict,
  category public.participant_category not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status public.enrollment_status not null default 'pendiente_pago',
  settlement public.enrollment_settlement,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (course_id, student_id),
  constraint enrollments_pending_or_confirmed check (
    (
      status = 'pendiente_pago'
      and settlement is null
      and confirmed_at is null
      and confirmed_by is null
    )
    or (
      status = 'inscrito'
      and settlement is not null
      and confirmed_at is not null
      and confirmed_by is not null
    )
  )
);

create index enrollments_course_idx on public.enrollments (course_id);
create index enrollments_student_idx on public.enrollments (student_id);
create index enrollments_status_idx on public.enrollments (status);

create or replace function public.enrollment_amount(
  p_course_id uuid,
  p_category public.participant_category
)
returns numeric
language sql
stable
as $$
  select case p_category
    when 'regular' then c.precio_regular
    when 'auxiliar_ad_honorem' then c.precio_auxiliar
    when 'beca' then 0
  end
  from public.courses c
  where c.id = p_course_id;
$$;

create or replace function public.enrollments_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.amount := public.enrollment_amount(new.course_id, new.category);

  if auth.uid() is not null and not public.is_admin() then
    new.status := 'pendiente_pago';
    new.settlement := null;
    new.confirmed_at := null;
    new.confirmed_by := null;
  end if;

  return new;
end;
$$;

create trigger enrollments_before_insert
  before insert on public.enrollments
  for each row
  execute procedure public.enrollments_before_insert();

alter table public.enrollments enable row level security;

create policy "enrollments_select_visible"
  on public.enrollments
  for select
  to authenticated
  using (
    student_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.courses c
      where c.id = enrollments.course_id
        and c.instructor_id = auth.uid()
    )
  );

create policy "enrollments_insert_student"
  on public.enrollments
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and status = 'pendiente_pago'
    and settlement is null
    and confirmed_at is null
    and confirmed_by is null
    and exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.published
    )
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'estudiante'
    )
  );

create policy "enrollments_update_admin"
  on public.enrollments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant execute on function public.enrollment_amount(uuid, public.participant_category)
  to authenticated;
