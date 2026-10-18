import { AuthForm } from "@/components/auth/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
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
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El registro público es para estudiantes.
        </p>
        <div className="mt-8">
          <AuthForm mode="registro" />
        </div>
      </section>
    </main>
  );
}
