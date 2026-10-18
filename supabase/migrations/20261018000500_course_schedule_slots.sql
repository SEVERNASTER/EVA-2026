create table public.course_schedule_slots (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  starts_at time not null,
  ends_at time,
  sort_order smallint not null default 0,
  constraint course_schedule_slots_range check (
    ends_at is null or ends_at > starts_at
  )
);

create index course_schedule_slots_course_idx
  on public.course_schedule_slots (course_id, sort_order, weekday, starts_at);

alter table public.course_schedule_slots enable row level security;

create policy "course_schedule_slots_select_visible"
  on public.course_schedule_slots
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.courses c
      where c.id = course_id
        and (
          c.published
          or c.instructor_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "course_schedule_slots_write_admin"
  on public.course_schedule_slots
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
