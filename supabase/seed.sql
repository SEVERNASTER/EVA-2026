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
    'dennis-admin@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dennis"}',
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
    'jhonatan-instructor@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jhonatan"}',
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
    'luciana-estudiante@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Luciana"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'rodrigo-estudiante@eva.local',
    extensions.crypt('eva2026', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rodrigo"}',
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
where email in (
  'dennis-admin@eva.local',
  'jhonatan-instructor@eva.local',
  'luciana-estudiante@eva.local',
  'rodrigo-estudiante@eva.local'
);

update public.profiles
set role = 'admin', full_name = 'Dennis'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles
set role = 'instructor', full_name = 'Jhonatan'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles
set role = 'estudiante', full_name = 'Luciana'
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles
set role = 'estudiante', full_name = 'Rodrigo'
where id = '44444444-4444-4444-4444-444444444444';

insert into public.courses (
  name,
  content,
  hours,
  schedule,
  instructor_id,
  published,
  nota_minima,
  asistencia_minima,
  precio_regular
)
values
  (
    'Node.js: APIs REST y autenticación',
    'Diseño de servicios HTTP con Express, validación de entrada, JWT y despliegue de un API de consulta académica. Incluye pruebas de endpoints y manejo de errores.',
    40,
    'Lunes y miércoles 18:30–21:00, laboratorio CS-2',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    80,
    450
  ),
  (
    'React y TypeScript para interfaces web',
    'Componentes, estado, enrutamiento y consumo de APIs. Se construye un panel de inscripción con formularios y tablas, con TypeScript estricto.',
    40,
    'Martes y jueves 19:00–21:30, laboratorio CS-1',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    75,
    480
  ),
  (
    'PostgreSQL aplicado a sistemas institucionales',
    'Modelo relacional, claves, índices, transacciones y consultas para matrícula, notas y reportes. Introducción a políticas de acceso a nivel de fila.',
    32,
    'Sábados 08:00–12:00, aula 4 CS',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    80,
    380
  ),
  (
    'Git y colaboración en repositorios de equipo',
    'Ramas, pull requests, resolución de conflictos y convenciones de commit. Flujo adecuado a un proyecto de laboratorio de tres o más integrantes.',
    16,
    'Viernes 18:00–22:00, laboratorio CS-3 (4 sesiones)',
    '22222222-2222-2222-2222-222222222222',
    true,
    65,
    80,
    180
  ),
  (
    'Docker y empaquetado de servicios',
    'Imágenes, volúmenes, redes y Compose para levantar API, base de datos y un reverse proxy en el entorno de desarrollo del curso.',
    24,
    'Lunes y viernes 18:30–21:30, laboratorio CS-2',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    80,
    320
  ),
  (
    'Fundamentos de ciberseguridad para desarrolladores',
    'Amenazas habituales en aplicaciones web, hashing de contraseñas, control de sesiones y lectura de registros. Sin ejercicios de ataque a sistemas ajenos.',
    32,
    'Miércoles 18:00–22:00, aula magna CS',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    85,
    400
  ),
  (
    'Python para análisis de datos académicos',
    'Pandas, limpieza de CSV de notas y asistencia, gráficos y un informe reproducible en notebook. Pensado para auxiliares y tesistas.',
    40,
    'Martes y jueves 18:00–20:30, laboratorio CS-4',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    75,
    360
  ),
  (
    'SQL avanzado y optimización de consultas',
    'Joins, ventanas, EXPLAIN y rediseño de consultas lentas sobre un esquema de cursos e inscripciones con volumen sintético.',
    24,
    'Sábados 14:00–18:00, laboratorio CS-1',
    '22222222-2222-2222-2222-222222222222',
    true,
    75,
    80,
    300
  ),
  (
    'Linux para laboratorios de computación',
    'Usuarios, permisos, systemd, red básica y scripts de arranque de servicios del laboratorio. Evaluación con checklist de administración.',
    20,
    'Jueves 18:00–21:20, sala de servidores CS',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    80,
    220
  ),
  (
    'Ingeniería de requisitos y modelado UML',
    'Historias de usuario, casos de uso, diagramas de clases y secuencia aplicados a una plataforma de certificación digital.',
    24,
    'Lunes 19:00–22:00, aula 2 CS',
    '22222222-2222-2222-2222-222222222222',
    true,
    70,
    75,
    250
  ),
  (
    'Next.js: renderizado en servidor y rutas de API',
    'App Router, sesiones con cookies y generación de páginas públicas de verificación. Curso en preparación; aún no abierto a inscripción.',
    32,
    'Martes y jueves 18:30–21:00, laboratorio CS-2 (por confirmar)',
    '22222222-2222-2222-2222-222222222222',
    false,
    70,
    80,
    420
  ),
  (
    'Pruebas automatizadas con Jest y Testing Library',
    'Pruebas unitarias y de componente sobre formularios de login y listados. Pendiente de asignación de aula.',
    20,
    'Horario por definir, segundo bloque',
    '22222222-2222-2222-2222-222222222222',
    false,
    70,
    80,
    240
  ),
  (
    'OpenAPI y contratos de integración',
    'Especificación de endpoints, versionado y cliente generado. Borrador interno del departamento.',
    16,
    'Por definir',
    '22222222-2222-2222-2222-222222222222',
    false,
    70,
    80,
    200
  ),
  (
    'Introducción a modelos de lenguaje con Python',
    'Uso responsable de APIs de modelos, RAG sencillo sobre documentos del curso y límites de alucinación. No publicado hasta completar el material.',
    28,
    'Sábados 08:30–12:30, aula 5 CS (tentativo)',
    '22222222-2222-2222-2222-222222222222',
    false,
    70,
    80,
    390
  );

update public.courses
set precio_auxiliar = round((precio_regular * 0.5)::numeric, 2)
where published;

-- Luciana: preinscripción regular pendiente de pago (Node.js)
insert into public.enrollments (course_id, student_id, category, amount, status)
select
  id,
  '33333333-3333-3333-3333-333333333333',
  'regular',
  precio_regular,
  'pendiente_pago'
from public.courses
where name = 'Node.js: APIs REST y autenticación';

-- Rodrigo: inscrito como auxiliar ad-honorem con pago en caja (Node.js)
insert into public.enrollments (
  course_id,
  student_id,
  category,
  amount,
  status,
  settlement,
  confirmed_at,
  confirmed_by
)
select
  id,
  '44444444-4444-4444-4444-444444444444',
  'auxiliar_ad_honorem',
  precio_auxiliar,
  'inscrito',
  'caja',
  now(),
  '11111111-1111-1111-1111-111111111111'
from public.courses
where name = 'Node.js: APIs REST y autenticación';

-- Luciana: inscrita con pago en caja (Git)
insert into public.enrollments (
  course_id,
  student_id,
  category,
  amount,
  status,
  settlement,
  confirmed_at,
  confirmed_by
)
select
  id,
  '33333333-3333-3333-3333-333333333333',
  'regular',
  precio_regular,
  'inscrito',
  'caja',
  now(),
  '11111111-1111-1111-1111-111111111111'
from public.courses
where name = 'Git y colaboración en repositorios de equipo';
