create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null default '',
  hours integer not null check (hours > 0),
  schedule text not null default '',
  instructor_id uuid not null references public.profiles (id) on delete restrict,
  published boolean not null default false,
  nota_minima numeric(5, 2) not null default 70
    check (nota_minima >= 0 and nota_minima <= 100),
  asistencia_minima numeric(5, 2) not null default 80
    check (asistencia_minima >= 0 and asistencia_minima <= 100),
  precio_regular numeric(10, 2) not null check (precio_regular >= 0),
  created_at timestamptz not null default now()
);

create index courses_published_idx on public.courses (published);
create index courses_instructor_idx on public.courses (instructor_id);

alter table public.courses enable row level security;

create policy "courses_select_visible"
  on public.courses
  for select
  to authenticated
  using (
    published
    or instructor_id = auth.uid()
    or public.is_admin()
  );

create policy "courses_write_admin"
  on public.courses
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles_select_own" on public.profiles;

create policy "profiles_select_visible"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or role = 'instructor'
    or public.is_admin()
  );

grant execute on function public.is_admin() to authenticated;
