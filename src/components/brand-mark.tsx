import { Icon } from "@/components/ui/icon";

export function BrandMark({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const inverse = tone === "inverse";
  return (
    <span className="relative inline-flex items-center gap-2.5">
      <span
        className={
          inverse
            ? "flex size-9 items-center justify-center rounded-xl bg-white text-[#1e3a8a] shadow-sm"
            : "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
        }
      >
        <Icon name="workspace_premium" filled size={20} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={
            inverse
              ? "text-base font-semibold tracking-tight text-white"
              : "text-base font-semibold tracking-tight text-foreground"
          }
        >
          EVA
        </span>
        <span
          className={
            inverse
              ? "mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e2c47a]"
              : "mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold"
          }
        >
          2026
        </span>
      </span>
    </span>
  );
}
