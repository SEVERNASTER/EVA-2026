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
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="border-b border-sidebar-border px-4 py-5">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-sidebar-foreground">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon name="verified" filled size={18} />
            </span>
            EVA
          </p>
          <p className="mt-2 pl-10 text-xs text-muted-foreground">
            {roleLabel(role)}
          </p>
        </div>
        <AppNav role={role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
          <p className="truncate text-sm text-muted-foreground md:hidden">
            EVA · {roleLabel(role)}
          </p>
          <p className="hidden truncate text-sm font-medium text-foreground md:block">
            {name || "Cuenta"}
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <form action={signOut}>
              <button
                className="inline-flex items-center gap-1.5 rounded-2xl px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                type="submit"
              >
                <Icon name="logout" size={18} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
