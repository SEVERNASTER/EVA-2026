# EVA 2026

Next.js + TypeScript + Tailwind + Supabase. Auth local con Docker.

## Setup

Requisitos: Node, Docker Desktop **running**.

```bash
cp .env.example .env.local
npm install
npm run db:up
npm run dev
```

App: http://localhost:3000  
Studio: http://127.0.0.1:54323  
API: http://127.0.0.1:54321  
Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

`.env.example` son las keys **locales por defecto** del CLI. No las mezclar con las de un proyecto cloud.

## `npm run db:up` (`supabase start`)

Primera vez: Docker **pull** de ~10 imágenes (Postgres, GoTrue, Kong, PostgREST, Studio, Storage, Realtime, Edge, Analytics, Mailpit, …). Varios GB. 5–15 min según red. **Normal. Una sola vez.**

No usamos todo ese stack. EVA necesita Postgres + Auth + Kong (+ PostgREST). Storage entra con PDFs. Studio es UI. El resto viene con el CLI; no hay flag “solo auth”.

Siguientes arranques: segundos/minutos, sin re-descargar.

```bash
npm run db:status
npm run db:reset    # reaplica migrations + seed.sql
npm run db:down
```

`db:reset` después de cambiar `supabase/migrations/` o `supabase/seed.sql`.

## Cuentas seed

Password: `eva2026` (email ya confirmado). Confirmación de mail **off** en local.

| Rol | Email | Header |
| --- | --- | --- |
| admin | `dennis-admin@eva.local` | Dennis |
| instructor | `jhonatan-instructor@eva.local` | Jhonatan |
| estudiante | `luciana-estudiante@eva.local` | Luciana |
| estudiante | `rodrigo-estudiante@eva.local` | Rodrigo |

`/registro` → rol `estudiante` only.

Seed de cursos: 10 publicados + 4 borradores (instructor Jhonatan). Tras cambiar `supabase/seed.sql`, `npm run db:reset`.

## `docker-compose.yml`

Postgres extra en **54332**. No es el de la app. No levantar junto a `db:up` salvo que haga falta un psql aparte.

## Cloud (demo compartida)

Org en supabase.com → invite Developers → pegar URL + anon + service_role en `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` solo server-side.
