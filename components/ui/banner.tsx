import type { ReactNode } from "react";

/** Figma: Around / Jobs / Banner. Code Connect target. */
export function Banner({
  tone,
  title,
  body,
  action,
}: {
  tone: "success" | "warning" | "info" | "danger";
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  const styles = {
    success: "bg-success-success-50",
    warning: "bg-warning-warning-50",
    info: "bg-info-info-50",
    danger: "bg-error-error-50",
  };
  return (
    <div className={`flex flex-col gap-[12px] rounded-md px-[16px] py-[12px] sm:flex-row sm:items-center ${styles[tone]}`}>
      <div className="min-w-[0px] flex-1">
        <p className="text-body-sm-semibold text-text-primary">{title}</p>
        {body ? <p className="text-body-sm-regular text-text-secondary">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
