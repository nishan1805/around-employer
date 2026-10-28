/**
 * Undecided product copy. Callers pass the value from policy.ts.
 * The screen shows “Pending decision” until that value is approved.
 */
export function PendingDecision({ value, show = false }: { value: string | number; show?: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-[8px]">
      {show ? <span>{value}</span> : null}
      <span className="inline-flex items-center rounded-full bg-warning-warning-50 px-[8px] py-[2px] text-label-medium text-warning-warning-700">
        Pending decision
      </span>
    </span>
  );
}
