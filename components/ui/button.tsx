import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-primary text-white hover:bg-primary-primary-600",
  outline: "border border-border-default bg-white text-text-primary hover:bg-grey-grey-100",
  ghost: "bg-transparent text-text-primary hover:bg-grey-grey-100",
  danger: "bg-error-default text-white hover:brightness-95",
  dark: "bg-grey-grey-900 text-white hover:bg-grey-grey-800",
  link: "bg-transparent px-[0px] text-brand-primary hover:underline",
};

const sizes = {
  md: "h-[44px] px-[16px]",
  sm: "h-[40px] px-[12px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  children: ReactNode;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-[8px] rounded-sm text-body-sm-semibold whitespace-nowrap transition disabled:opacity-50",
    variants[variant],
    variant === "link" ? "h-auto" : sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
