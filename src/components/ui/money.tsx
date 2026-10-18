import { formatBs } from "@/lib/courses/types";

export function Money({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-semibold tabular-nums text-money ${className}`}
    >
      {formatBs(value)}
    </span>
  );
}
