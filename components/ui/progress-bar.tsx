/** Figma: progress bar used by verification steps and file uploads. Code Connect target. */
export function ProgressBar({
  steps = 1,
  current = 0,
  value,
}: {
  steps?: number;
  current?: number;
  value?: number;
}) {
  if (typeof value === "number") {
    return (
      <div className="h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    );
  }
  return (
    <div className="flex gap-1" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={steps}>
      {Array.from({ length: steps }).map((_, index) => (
        <span key={index} className={`h-1 flex-1 rounded-full ${index < current ? "bg-brand-primary" : "bg-line"}`} />
      ))}
    </div>
  );
}
