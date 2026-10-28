import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Figma: Around / Jobs / Input. Code Connect target. */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-sm border border-border-default bg-white px-3 text-body-sm-regular text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand-primary",
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
        "min-h-28 w-full rounded-sm border border-border-default bg-white px-3 py-3 text-body-sm-regular text-text-primary outline-none placeholder:text-text-tertiary focus:border-brand-primary",
        className,
      )}
    />
  );
}
