export function PanelSkeleton() {
  return (
    <div className="animate-pulse motion-reduce:animate-none">
      <div className="h-7 w-40 rounded-full bg-muted" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-muted" />
      <div className="mt-8 h-72 rounded-[1.4rem] bg-muted" />
    </div>
  );
}
