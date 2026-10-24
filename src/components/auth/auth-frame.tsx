import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/ui/icon";

const HIGHLIGHTS = [
  { icon: "menu_book", text: "Oferta de cursos de formación continua" },
  { icon: "fact_check", text: "Asistencia y notas registradas por el instructor" },
  { icon: "verified", text: "Certificado digital con código verificable" },
];

export function AuthFrame({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh flex-1 bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="brand-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="brand-grid pointer-events-none absolute inset-0" aria-hidden />
        <BrandMark tone="inverse" />
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e2c47a]">
            Formación continua
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Del curso al certificado, con datos que se pueden verificar.
          </h2>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex size-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15">
                  <Icon name={item.icon} size={18} />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/60">EVA 2026 · Proyecto académico</p>
      </aside>

      <div className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="lg:invisible">
            <BrandMark />
          </span>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <section className="auth-panel w-full max-w-[400px]">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            ) : null}
            <div className="mt-8">{children}</div>
            {footer}
          </section>
        </div>
      </div>
    </main>
  );
}
