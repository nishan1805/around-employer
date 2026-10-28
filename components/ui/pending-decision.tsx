import { cn } from "@/lib/utils";

/**
 * Undecided product copy. Callers pass the value from policy.ts.
 * The screen shows “Pending decision” until that value is approved.
 */
export function PendingDecision({ value, show = false, className }: { value: string | number; show?: boolean; className?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-[8px]">
      {show ? <span>{value}</span> : null}
      <span className={cn("inline-flex items-center rounded-full bg-warning-warning-50 px-[8px] py-[4px] text-label-medium text-warning-warning-700", className)}>
        Pending decision
      </span>
    </span>
  );
}
