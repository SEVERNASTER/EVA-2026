import type { ReactNode } from "react";

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "success" | "warning";
  children: ReactNode;
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-primary/20 text-accent-foreground dark:text-primary",
    warning: "bg-chart-5/25 text-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
