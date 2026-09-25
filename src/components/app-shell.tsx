import type { ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import { AppNav } from "@/components/app-nav";
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
    <div className="flex min-h-full flex-1 bg-black">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-panel md:flex md:flex-col">
        <div className="border-b border-line px-4 py-4">
          <p className="text-sm font-semibold tracking-tight text-white">EVA</p>
          <p className="mt-1 text-xs text-zinc-500">{roleLabel(role)}</p>
        </div>
        <AppNav role={role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-line px-4 md:px-6">
          <p className="truncate text-sm text-zinc-400 md:hidden">
            EVA · {roleLabel(role)}
          </p>
          <p className="hidden truncate text-sm text-zinc-400 md:block">
            {name || "Cuenta"}
          </p>
          <form action={signOut}>
            <button
              className="rounded-md px-2 py-1 text-sm text-zinc-400 transition-colors hover:text-white"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
