import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Figma: Around / Employer / Select. Code Connect target. */
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full appearance-none rounded-sm border border-border-default bg-white px-3 pr-32 text-body-sm-regular text-text-primary outline-none focus:border-brand-primary",
        className,
      )}
    />
  );
}
