import { cn } from "@/lib/utils";

/** Figma: Step Indicator. Code Connect target. */
export function StepIndicator({
  steps,
  current,
  label,
}: {
  steps: { id: string; label: string }[];
  current: number;
  label?: string;
}) {
  return (
    <div>
      {label ? <p className="mb-2 text-label-medium text-text-secondary">{label}</p> : null}
      <ol className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {steps.map((step, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <li
              key={step.id}
              className={cn(
                "shrink-0 rounded-md border px-3 py-3 text-body-sm-regular lg:w-full",
                active ? "border-brand-primary bg-white font-semibold text-brand-primary" : "border-border-default bg-white text-text-secondary",
                done && "text-text-primary",
              )}
            >
              <span className="mr-2 text-label-regular">0{index + 1}</span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
