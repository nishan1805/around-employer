import type { ApplicantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<ApplicantStatus, string> = {
  New: "bg-primary-primary-50 text-brand-primary",
  Shortlisted: "bg-info-info-50 text-info-info-700",
  Interviewing: "bg-features-features-50 text-features-features-500",
  Hired: "bg-success-success-50 text-success-success-700",
  Rejected: "bg-error-error-50 text-error-default",
};

/** Figma: stage chip on applicants and the candidate header. Code Connect target. */
export function StageChip({ status }: { status: ApplicantStatus }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-label-medium", tone[status])}>
      {status === "Rejected" ? "Not selected" : status}
    </span>
  );
}
