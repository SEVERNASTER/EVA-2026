"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/auth/roles";

const NAV: Record<UserRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Cursos" },
    { href: "/admin/inscripciones", label: "Inscripciones" },
  ],
  instructor: [{ href: "/instructor", label: "Cursos" }],
  estudiante: [{ href: "/estudiante", label: "Cursos" }],
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
    <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
      {NAV[role].map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-md bg-white/10 px-3 py-2 text-zinc-100"
                : "rounded-md px-3 py-2 text-zinc-500 hover:text-zinc-200"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
