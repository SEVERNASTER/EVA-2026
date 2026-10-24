import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { AppNav } from "@/components/app-nav";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { roleLabel, type UserRole } from "@/lib/auth/roles";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

const quietButton =
  "inline-flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function AppShell({
  role,
  name,
  children,
}: {
  role: UserRole;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-1 bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="px-5 pb-4 pt-6">
          <BrandMark />
        </div>
        <p className="px-6 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {roleLabel(role)}
        </p>
        <AppNav role={role} />
        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials(name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">
                {name || "Cuenta"}
              </span>
              <span className="block text-xs text-muted-foreground">{roleLabel(role)}</span>
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-1">
            <ThemeToggle />
            <form action={signOut}>
              <button className={quietButton} type="submit">
                <Icon name="logout" size={18} />
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action={signOut}>
                <button className={quietButton} type="submit">
                  <Icon name="logout" size={18} />
                  <span className="sr-only">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
          <AppNav role={role} orientation="horizontal" />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-10 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
