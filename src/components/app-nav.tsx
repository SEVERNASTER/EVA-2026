"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { UserRole } from "@/lib/auth/roles";

const NAV: Record<
  UserRole,
  { href: string; label: string; icon: string }[]
> = {
  admin: [
    { href: "/admin", label: "Cursos", icon: "menu_book" },
    { href: "/admin/inscripciones", label: "Inscripciones", icon: "how_to_reg" },
  ],
  instructor: [{ href: "/instructor", label: "Cursos", icon: "menu_book" }],
  estudiante: [{ href: "/estudiante", label: "Cursos", icon: "school" }],
};

function isActive(href: string, pathname: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/cursos");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1.5 p-3 text-sm">
      {NAV[role].map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "flex items-center gap-2.5 rounded-2xl bg-primary px-3 py-2.5 font-medium text-primary-foreground shadow-sm"
                : "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            }
          >
            <Icon name={item.icon} filled={active} size={20} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
