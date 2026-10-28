import type { JobStatus } from "@/lib/types";
import { JOB_STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";

const tone: Record<JobStatus, string> = {
  active: "bg-success-success-50 text-success-success-700",
  paused: "bg-warning-warning-50 text-warning-warning-700",
  returned: "bg-warning-warning-100 text-warning-warning-800",
  expired: "bg-error-error-50 text-error-default",
  draft: "bg-grey-grey-100 text-text-secondary",
  pending_review: "bg-info-info-50 text-info-info-700",
  closed: "bg-grey-grey-100 text-text-secondary",
};

/** Figma: Around / Job Status Badge. Code Connect target. */
export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={cn("inline-flex h-[24px] items-center rounded-full px-[12px] text-label-medium", tone[status])}>
      {JOB_STATUS_LABEL[status]}
    </span>
  );
}
