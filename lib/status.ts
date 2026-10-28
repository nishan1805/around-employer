import type { AccountStatus, CompanyVerificationStatus, JobStatus } from "@/lib/types";

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  returned: "Returned",
  paused: "Paused",
  expired: "Expired",
  closed: "Closed",
};

export const VERIFICATION_LABEL: Record<CompanyVerificationStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  pending: "Pending",
  verified: "Verified",
  additional_info_required: "Additional info required",
  rejected: "Rejected",
};

/** A job can be submitted for review only when the company is verified and the account is active. */
export function canSubmitJobForReview(
  account: AccountStatus,
  verification: CompanyVerificationStatus,
) {
  return account === "Active" && verification === "verified";
}

export function submitBlockReason(
  account: AccountStatus,
  verification: CompanyVerificationStatus,
) {
  if (account === "Suspended") {
    return "This account is suspended. You can edit drafts, but jobs cannot be submitted for review.";
  }
  if (verification !== "verified") {
    return "Publishing is locked until your company is verified. You can still save drafts.";
  }
  return null;
}

export function verificationTone(
  status: CompanyVerificationStatus,
): "success" | "warning" | "danger" | "info" {
  if (status === "verified") return "success";
  if (status === "rejected") return "danger";
  if (status === "additional_info_required" || status === "pending") return "warning";
  return "info";
}
