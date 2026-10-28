import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Figma: Around / Employer / Select. Code Connect target. */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-[44px] w-full appearance-none rounded-sm border border-border-default bg-white px-[12px] pr-[32px] text-body-sm-regular text-text-primary outline-none focus:border-brand-primary",
        className,
      )}
    />
  );
}
