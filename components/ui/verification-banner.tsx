import type { ReactNode } from "react";
import type { CompanyVerificationStatus } from "@/lib/types";
import { VERIFICATION_LABEL } from "@/lib/status";

/** Figma: Around / Verification Banner. Separate from the account banner. Code Connect target. */
export function VerificationBanner({
  status,
  title,
  body,
  action,
}: {
  status: CompanyVerificationStatus;
  title?: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  const tone =
    status === "verified"
      ? "bg-success-success-50"
      : status === "rejected"
        ? "bg-error-error-50"
        : status === "pending" || status === "additional_info_required"
          ? "bg-warning-warning-50"
          : "bg-info-info-50";
  return (
    <div className={`flex flex-col gap-[12px] rounded-md px-[16px] py-[12px] sm:flex-row sm:items-center ${tone}`}>
      <div className="min-w-[0px] flex-1">
        <p className="text-label-medium text-text-secondary">Company verification · {VERIFICATION_LABEL[status]}</p>
        <p className="text-body-sm-semibold text-text-primary">{title ?? VERIFICATION_LABEL[status]}</p>
        {body ? <p className="text-body-sm-regular text-text-secondary">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}
