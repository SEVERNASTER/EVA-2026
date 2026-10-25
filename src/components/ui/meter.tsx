/** Barra de progreso con marca del mínimo requerido. */
export function Meter({
  label,
  value,
  display,
  min,
  minLabel,
}: {
  label: string;
  value: number | null;
  display: string;
  min: number;
  minLabel: string;
}) {
  const percent = value === null ? 0 : Math.max(0, Math.min(100, value));
  const passed = value !== null && value >= min;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-foreground">{display}</span>
      </div>
      <div
        className="relative mt-1.5 h-2 rounded-full bg-muted"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? 0}
      >
        <div
          className={`h-full rounded-full ${passed ? "bg-success-foreground" : "bg-warning-foreground"}`}
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute -top-1 h-4 w-0.5 rounded-full bg-foreground/60"
          style={{ left: `calc(${Math.min(100, min)}% - 1px)` }}
          aria-hidden
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{minLabel}</p>
    </div>
  );
}
