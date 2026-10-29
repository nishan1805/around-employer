import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Figma: Around / Jobs / Input. Code Connect target. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-[44px] w-full rounded-sm border border-border-default bg-white px-[12px] text-body-sm-regular text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand-primary disabled:bg-grey-grey-100 disabled:text-text-disabled",
        className,
      )}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[112px] w-full rounded-sm border border-border-default bg-white px-[12px] py-[12px] text-body-sm-regular text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand-primary",
        className,
      )}
    />
  );
}
