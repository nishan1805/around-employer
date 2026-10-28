import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Figma: Around / Employer / Select. Code Connect target. */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block w-full", className)}>
      <select
        {...props}
        className="h-[44px] w-full appearance-none rounded-sm border border-border-default bg-white px-[12px] pr-[40px] text-body-sm-regular text-text-primary outline-none focus:border-brand-primary"
      />
      <ChevronDown size={16} aria-hidden className="pointer-events-none absolute top-1/2 right-[12px] -translate-y-1/2 text-text-secondary" />
    </span>
  );
}
