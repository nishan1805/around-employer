import { cn } from "@/lib/utils";

/** Figma toggle. States: On, Off, Disabled. */
export function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-[24px] w-[40px] rounded-full transition",
        checked && !disabled ? "bg-brand-primary" : "bg-grey-grey-300",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className={cn("absolute top-[4px] size-[16px] rounded-full bg-white", checked ? "left-[20px]" : "left-[4px]")} />
    </button>
  );
}
