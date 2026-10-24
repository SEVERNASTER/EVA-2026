import type { ReactNode } from "react";

export type BadgeTone = "muted" | "success" | "warning" | "info" | "gold" | "danger";

const TONES: Record<BadgeTone, string> = {
  muted: "bg-muted text-muted-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
  gold: "bg-gold-soft text-gold-foreground ring-1 ring-inset ring-gold/40",
  danger: "bg-destructive/10 text-destructive",
};

export function Badge({
  tone = "muted",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
