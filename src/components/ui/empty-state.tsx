import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function EmptyState({
  icon = "inbox",
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[1.4rem] border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      {children ? (
        <div className="mt-1 max-w-sm text-sm text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}
