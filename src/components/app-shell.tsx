import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { AppNav } from "@/components/app-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { roleLabel, type UserRole } from "@/lib/auth/roles";

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
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-4 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-sidebar-foreground">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon name="verified" filled size={18} />
            </span>
            EVA
          </p>
          <p className="mt-2 pl-10 text-xs text-muted-foreground">{roleLabel(role)}</p>
        </div>
        <AppNav role={role} />
        <div className="mt-auto border-t border-sidebar-border p-3">
          <p className="truncate px-2 pb-2 text-sm font-medium text-sidebar-foreground">
            {name || "Cuenta"}
          </p>
          <div className="flex flex-col gap-1">
            <ThemeToggle />
            <form action={signOut}>
              <button
                className="inline-flex w-full items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                type="submit"
              >
                <Icon name="logout" size={18} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b border-border px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-foreground">
              EVA · {roleLabel(role)}
            </p>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <form action={signOut}>
                <button
                  className="inline-flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  type="submit"
                >
                  <Icon name="logout" size={18} />
                  <span className="sr-only">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
          <AppNav role={role} orientation="horizontal" />
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
