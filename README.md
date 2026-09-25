# EVA 2026

Plataforma de formación continua con certificación digital verificable (proyecto universitario).

**Stack:** Next.js + TypeScript + Tailwind + Supabase.

Dos deploys, no tres: la app (UI + Route Handlers) y el proyecto de Supabase (Postgres, Auth, Storage, PostgREST).

## Arranque

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El backend de Next responde en [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Supabase local (Docker)

Hace falta Docker Desktop. Cada persona tiene su propia instancia; no necesitan la cuenta de la org.

```bash
npm run supabase:start
```

Eso levanta Postgres, Auth, Storage y Studio. Las keys de `.env.example` son las de este stack local (no sirven en cloud).

```bash
npm run supabase:status
npm run supabase:stop
```

Las tablas van en `supabase/migrations/` (aún vacío a propósito: el esquema sale con las features).

## Proyecto compartido (demo)

1. Crear una **organización** en [supabase.com](https://supabase.com) e invitar al equipo como Developer.
2. Crear un proyecto y copiar URL + anon key + service role a `.env.local` (no subir keys de cloud).
3. La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en Route Handlers, nunca en el cliente.

## Dónde va cada request

| Destino | Ejemplo | Qué es |
| --- | --- | --- |
| Next.js | `POST /api/...` en este dominio | Backend de la app (Vercel / `next dev`) |
| Supabase | `*.supabase.co/rest/v1/...` | PostgREST (CRUD de tablas) |

Los comandos de negocio (inscribir, emitir certificado) irán a `/api`. PostgREST no se despliega aparte: viene con el proyecto de Supabase.
