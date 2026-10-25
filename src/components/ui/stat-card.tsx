import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export type StatTone = "primary" | "success" | "warning" | "gold";

const ICON_TONES: Record<StatTone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  gold: "bg-gold-soft text-gold-foreground",
};

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: string;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}
        >
          <Icon name={icon} size={20} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
