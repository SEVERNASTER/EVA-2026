import type { ReactNode } from "react";
import { AuthForm } from "@/components/auth/auth-form";

function AuthFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-shell flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <section className="auth-panel w-full max-w-[380px] rounded-xl border border-line bg-panel p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-lg font-semibold tracking-tight text-white">EVA</p>
        <h1 className="mt-8 text-[22px] font-semibold tracking-tight text-white">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <AuthFrame title="Iniciar sesión">
      <AuthForm mode="login" />
      <details className="mt-8 border-t border-line pt-4 text-xs text-zinc-500">
        <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
          Cuentas de demostración
        </summary>
        <ul className="mt-3 space-y-1 font-mono text-[11px] text-zinc-500">
          <li>admin@eva.local</li>
          <li>instructor@eva.local</li>
          <li>estudiante@eva.local</li>
          <li>contraseña: eva2026</li>
        </ul>
      </details>
    </AuthFrame>
  );
}
