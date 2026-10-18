create or replace function public.can_teach_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.courses c
      where c.id = p_course_id
        and c.instructor_id = auth.uid()
    );
$$;

create or replace function public.enrollment_course_id(p_enrollment_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select e.course_id
  from public.enrollments e
  where e.id = p_enrollment_id;
$$;

create or replace function public.is_enrolled_student(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = p_course_id
      and e.student_id = auth.uid()
      and e.status = 'inscrito'
  );
$$;

create or replace function public.teaches_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.student_id = p_student_id
      and c.instructor_id = auth.uid()
  );
$$;

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  session_date date not null,
  topic text not null default '',
  created_at timestamptz not null default now(),
  unique (course_id, session_date)
);

create index sessions_course_idx on public.sessions (course_id);

create table public.attendance (
  session_id uuid not null references public.sessions (id) on delete cascade,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  present boolean not null default false,
  primary key (session_id, enrollment_id)
);

create index attendance_enrollment_idx on public.attendance (enrollment_id);

create table public.grades (
  enrollment_id uuid primary key references public.enrollments (id) on delete cascade,
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  graded_by uuid not null references public.profiles (id) on delete restrict,
  updated_at timestamptz not null default now()
);

create or replace function public.attendance_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.enrollments e
    join public.sessions s on s.course_id = e.course_id
    where e.id = new.enrollment_id
      and s.id = new.session_id
      and e.status = 'inscrito'
  ) then
    raise exception 'La asistencia solo se registra para inscritos del curso de la sesión.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger attendance_before_write
  before insert or update on public.attendance
  for each row
  execute procedure public.attendance_before_write();

create or replace function public.grades_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.enrollments e
    where e.id = new.enrollment_id
      and e.status = 'inscrito'
  ) then
    raise exception 'La nota solo se registra para participantes inscritos.'
      using errcode = 'P0001';
  end if;

  new.graded_by := coalesce(auth.uid(), new.graded_by);
  new.updated_at := now();
  return new;
end;
$$;

create trigger grades_before_write
  before insert or update on public.grades
  for each row
  execute procedure public.grades_before_write();

alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.grades enable row level security;

create policy "sessions_select_visible"
  on public.sessions
  for select
  to authenticated
  using (
    public.can_teach_course(course_id)
    or public.is_enrolled_student(course_id)
  );

create policy "sessions_write_teacher"
  on public.sessions
  for all
  to authenticated
  using (public.can_teach_course(course_id))
  with check (public.can_teach_course(course_id));

create policy "attendance_select_visible"
  on public.attendance
  for select
  to authenticated
  using (
    public.can_teach_course(public.enrollment_course_id(enrollment_id))
    or exists (
      select 1
      from public.enrollments e
      where e.id = attendance.enrollment_id
        and e.student_id = auth.uid()
    )
  );

create policy "attendance_write_teacher"
  on public.attendance
  for all
  to authenticated
  using (public.can_teach_course(public.enrollment_course_id(enrollment_id)))
  with check (public.can_teach_course(public.enrollment_course_id(enrollment_id)));

create policy "grades_select_visible"
  on public.grades
  for select
  to authenticated
  using (
    public.can_teach_course(public.enrollment_course_id(enrollment_id))
    or exists (
      select 1
      from public.enrollments e
      where e.id = grades.enrollment_id
        and e.student_id = auth.uid()
    )
  );

create policy "grades_write_teacher"
  on public.grades
  for all
  to authenticated
  using (public.can_teach_course(public.enrollment_course_id(enrollment_id)))
  with check (public.can_teach_course(public.enrollment_course_id(enrollment_id)));

drop policy if exists "profiles_select_visible" on public.profiles;

create policy "profiles_select_visible"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or role = 'instructor'
    or public.is_admin()
    or public.teaches_student(id)
  );

grant execute on function public.can_teach_course(uuid) to authenticated;
grant execute on function public.enrollment_course_id(uuid) to authenticated;
grant execute on function public.is_enrolled_student(uuid) to authenticated;
grant execute on function public.teaches_student(uuid) to authenticated;
