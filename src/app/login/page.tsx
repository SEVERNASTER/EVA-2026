import { AuthForm } from "@/components/auth/auth-form";
import { AuthFrame } from "@/components/auth/auth-frame";
import { Icon } from "@/components/ui/icon";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "dennis-admin@eva.local" },
  { role: "Instructor", email: "jhonatan-instructor@eva.local" },
  { role: "Estudiante", email: "luciana-estudiante@eva.local" },
  { role: "Estudiante", email: "rodrigo-estudiante@eva.local" },
];

export default function LoginPage() {
  return (
    <AuthFrame
      title="Iniciar sesión"
      description="Entra con tu correo para ir al panel de tu rol."
      footer={
        <details className="group mt-8 rounded-2xl border border-border bg-card p-4 text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-foreground">
            <span className="inline-flex items-center gap-2">
              <Icon name="key" size={18} className="text-primary-soft-foreground" />
              Cuentas de demostración
            </span>
            <Icon
              name="expand_more"
              size={18}
              className="text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <ul className="mt-3 divide-y divide-border text-xs">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex items-center justify-between gap-3 py-2">
                <span className="font-mono text-foreground">{account.email}</span>
                <span className="text-muted-foreground">{account.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Contraseña: <span className="font-mono text-foreground">eva2026</span>
          </p>
        </details>
      }
    >
      <AuthForm mode="login" />
    </AuthFrame>
  );
}
