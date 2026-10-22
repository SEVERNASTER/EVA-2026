"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { UserRole } from "@/lib/auth/roles";

const NAV: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  admin: [
    { href: "/admin", label: "Cursos", icon: "menu_book" },
    { href: "/admin/inscripciones", label: "Inscripciones", icon: "how_to_reg" },
  ],
  instructor: [{ href: "/instructor", label: "Mis cursos", icon: "co_present" }],
  estudiante: [{ href: "/estudiante", label: "Cursos", icon: "school" }],
};

function isActive(href: string, pathname: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/cursos");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({
  role,
  orientation = "vertical",
}: {
  role: UserRole;
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";

  return (
    <nav
      className={
        horizontal
          ? "flex gap-1 overflow-x-auto text-sm"
          : "flex flex-1 flex-col gap-1 px-3 py-2 text-sm"
      }
    >
      {NAV[role].map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "relative flex shrink-0 items-center gap-2.5 rounded-2xl bg-sidebar-accent px-3 py-2.5 font-semibold text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                : "flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
