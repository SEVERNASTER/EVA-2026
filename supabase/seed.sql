-- Cuentas de demostración (correo ya confirmado). Contraseña: eva2026
-- El trigger crea profiles como estudiante; luego se ajusta el rol.

create extension if not exists pgcrypto with schema extensions;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ana Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'instructor@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Iván Instructor"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'estudiante@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elena Estudiante"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  created_at,
  created_at,
  created_at
from auth.users
where email in ('admin@eva.local', 'instructor@eva.local', 'estudiante@eva.local');

update public.profiles
set role = 'admin', full_name = 'Ana Admin'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles
set role = 'instructor', full_name = 'Iván Instructor'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles
set role = 'estudiante', full_name = 'Elena Estudiante'
where id = '33333333-3333-3333-3333-333333333333';
