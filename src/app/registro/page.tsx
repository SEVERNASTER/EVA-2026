import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-shell flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <section className="auth-panel w-full max-w-[380px] rounded-xl border border-line bg-panel p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-lg font-semibold tracking-tight text-white">EVA</p>
        <h1 className="mt-8 text-[22px] font-semibold tracking-tight text-white">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          El registro público es para estudiantes.
        </p>
        <div className="mt-8">
          <AuthForm mode="registro" />
        </div>
      </section>
    </main>
  );
}
