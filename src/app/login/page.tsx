import type { ReactNode } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

function AuthFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-4 w-full max-w-[380px] flex justify-end">
        <ThemeToggle />
      </div>
      <section className="auth-panel w-full max-w-[380px] rounded-[1.4rem] border border-border bg-card p-8 shadow-lg">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          EVA
        </p>
        <h1 className="mt-8 text-[22px] font-semibold tracking-tight text-foreground">
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
      <details className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          Cuentas de demostración
        </summary>
        <ul className="mt-3 space-y-1 font-mono text-[11px]">
          <li>dennis-admin@eva.local</li>
          <li>jhonatan-instructor@eva.local</li>
          <li>luciana-estudiante@eva.local</li>
          <li>rodrigo-estudiante@eva.local</li>
          <li>contraseña: eva2026</li>
        </ul>
      </details>
    </AuthFrame>
  );
}
