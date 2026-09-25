export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          EVA 2026
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Formación continua
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Base del proyecto: Next.js, TypeScript, Tailwind y Supabase. Las
          features (cursos, inscripción, certificados) se definen en el
          siguiente paso.
        </p>
        <dl className="mt-8 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <dt className="text-zinc-500">App</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              Next.js (UI + Route Handlers)
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <dt className="text-zinc-500">Datos / Auth</dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">
              Supabase
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <dt className="text-zinc-500">Health</dt>
            <dd>
              <a
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100"
                href="/api/health"
              >
                GET /api/health
              </a>
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
