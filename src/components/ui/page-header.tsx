import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function PageHeader({
  icon,
  eyebrow,
  title,
  description,
  actions,
}: {
  icon?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        {icon ? (
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground sm:flex">
            <Icon name={icon} size={24} />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-soft-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
