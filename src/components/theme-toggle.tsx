"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("eva-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("eva-theme");
    const next: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(next);
    applyTheme(next);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => {
        const next: Theme = isDark ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
      }}
    >
      {isDark ? "Claro" : "Oscuro"}
    </button>
  );
}
