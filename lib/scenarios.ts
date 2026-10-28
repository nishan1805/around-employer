import type { AccountStatus, CompanyVerificationStatus } from "@/lib/types";

export interface ScenarioOption {
  id: string;
  label: string;
}

export const ROUTE_STATES: { match: (path: string) => boolean; states: ScenarioOption[] }[] = [
  {
    match: (path) => path === "/",
    states: [
      { id: "default", label: "E00 Default" },
      { id: "pending-review", label: "E00b Pending review" },
      { id: "empty", label: "E00c Empty" },
      { id: "verification-pending", label: "E00d / V08 Pending" },
      { id: "returned", label: "E00e Returned" },
      { id: "expiring", label: "E00f Expiring" },
      { id: "plan-limit", label: "E00g Plan limit" },
      { id: "notifications", label: "E00h Notifications" },
      { id: "account-menu", label: "E00i Account menu" },
      { id: "loading", label: "E00j Loading" },
      { id: "error", label: "E00k Load failed" },
      { id: "new-applicants", label: "E00l New applicants" },
      { id: "suspended", label: "A12 Suspended" },
      { id: "v08b", label: "V08b Reference status" },
      { id: "v09a", label: "V09a Additional info" },
      { id: "v09b", label: "V09b Rejected" },
      { id: "v12", label: "V12 Manual review" },
    ],
  },
  {
    match: (path) => path === "/jobs",
    states: [
      { id: "default", label: "E03a All jobs" },
      { id: "returned", label: "E03b Returned" },
      { id: "actions", label: "E03c Actions menu" },
      { id: "empty", label: "E03i Empty" },
      { id: "no-results", label: "E03j No results" },
    ],
  },
  {
    match: (path) => /^\/jobs\/[^/]+$/.test(path),
    states: [
      { id: "active", label: "E13a Active" },
      { id: "pending-review", label: "E13b Pending review" },
      { id: "returned", label: "E13c Returned" },
      { id: "paused", label: "E13d Paused" },
      { id: "closed", label: "E13e Closed" },
      { id: "expired", label: "E13f Expired" },
      { id: "draft", label: "E13g Draft" },
      { id: "actions", label: "E13h Actions menu" },
      { id: "loading", label: "E13i Loading" },
      { id: "error", label: "E13j Load failed" },
    ],
  },
  {
    match: (path) => path === "/post-job",
    states: [
      { id: "choose", label: "E08a Choose method" },
      { id: "paste", label: "E08b Paste description" },
      { id: "processing", label: "E08c Processing" },
      { id: "extract-failed", label: "E08e Processing failed" },
      { id: "details-ai", label: "E08f Details (AI)" },
      { id: "details", label: "E08g Details (manual)" },
      { id: "details-invalid", label: "E08g Validation" },
      { id: "pay", label: "E08h Pay & requirements" },
      { id: "review", label: "E08i Review" },
      { id: "confirm", label: "E08j Submit confirm" },
      { id: "gate", label: "Verification gate" },
    ],
  },
  {
    match: (path) => path === "/applicants",
    states: [
      { id: "default", label: "E04a Applicants" },
      { id: "no-results", label: "E04b No results" },
      { id: "loading", label: "E04c Loading" },
      { id: "error", label: "E04d Load failed" },
    ],
  },
  {
    match: (path) => /^\/applicants\/[^/]+$/.test(path),
    states: [
      { id: "overview", label: "E10a Overview" },
      { id: "resume", label: "E10b Resume" },
      { id: "no-resume", label: "E10b No resume" },
      { id: "unsupported", label: "E10b Unsupported file" },
      { id: "resume-error", label: "E10b Resume failed" },
      { id: "loading", label: "E10c Loading" },
      { id: "error", label: "E10d Load failed" },
    ],
  },
  {
    match: (path) => path.startsWith("/jobs/") && path.endsWith("/applicants"),
    states: [{ id: "detail", label: "E04 Job applicants" }],
  },
  {
    match: (path) => path === "/company",
    states: [
      { id: "default", label: "E05 Profile" },
      { id: "errors", label: "E05b Validation" },
      { id: "unsaved", label: "E05c Unsaved" },
      { id: "preview", label: "E05i Preview drawer" },
      { id: "documents", label: "E11 Documents" },
    ],
  },
  {
    match: (path) => path === "/verification",
    states: [
      { id: "v01", label: "V01 Business lookup" },
      { id: "v01-loading", label: "V01a Lookup loading" },
      { id: "v01-failed", label: "V01b Lookup failed" },
      { id: "v01-none", label: "V01c No listing" },
      { id: "v01-manual", label: "V01f Manual entry" },
      { id: "v02", label: "V02 Phone OTP" },
      { id: "v02-partial", label: "V02b Partial code" },
      { id: "v02-verifying", label: "V02c Verifying" },
      { id: "v02-incorrect", label: "V02e Incorrect" },
      { id: "v02-expired", label: "V02f Expired" },
      { id: "v02-rate-limited", label: "V02h Rate limited" },
      { id: "v02-locked", label: "V02i Locked" },
      { id: "v02-network", label: "V02j Network error" },
      { id: "v03", label: "V03 Document upload" },
      { id: "v03-types", label: "V03a Document types" },
      { id: "v03-uploading", label: "V03b Uploading" },
      { id: "v03-uploaded", label: "V03c Uploaded" },
      { id: "v03-failed", label: "V03d Upload failed" },
      { id: "v03-cancelled", label: "V03e Cancelled" },
      { id: "v03-other", label: "V03f Other document" },
      { id: "v04", label: "V04 Representative" },
      { id: "v04-partial", label: "V04a Email code" },
      { id: "v04-incorrect", label: "V04b Incorrect email code" },
      { id: "v04-expired", label: "V04c Email expired" },
      { id: "v04-verified", label: "V04e Email verified" },
      { id: "v04-id", label: "V04f ID selected" },
      { id: "v04-id-invalid", label: "V04g ID invalid" },
      { id: "v04-id-uploaded", label: "V04h ID uploaded" },
      { id: "v05", label: "V05 Review" },
      { id: "v05-submitting", label: "V05b Submitting" },
      { id: "v05-failed", label: "V05c Submission failed" },
      { id: "v06", label: "V06 Submitted" },
      { id: "v06b", label: "V06b Manual review note" },
      { id: "v10", label: "V10 Resubmitted" },
      { id: "v11", label: "V11 Verified" },
      { id: "v00", label: "V00 Draft saved" },
    ],
  },
  {
    match: (path) => path === "/settings",
    states: [
      { id: "default", label: "Account" },
      { id: "account-invalid", label: "Account validation" },
      { id: "account-saving", label: "Account saving" },
      { id: "account-saved", label: "Account saved" },
      { id: "account-error", label: "Account error" },
      { id: "change-number", label: "Change number OTP" },
      { id: "change-number-error", label: "Change number failed" },
      { id: "close-confirm", label: "Close account confirm" },
      { id: "close-unavailable", label: "Close account unavailable" },
      { id: "team", label: "Team members" },
      { id: "team-menu", label: "Team actions" },
      { id: "team-pending-menu", label: "Pending invite actions" },
      { id: "team-remove-confirm", label: "Remove confirm" },
      { id: "team-invite-invalid", label: "Invite validation" },
      { id: "team-invite-submitting", label: "Invite submitting" },
      { id: "team-invite-success", label: "Invite saved" },
      { id: "team-invite-error", label: "Invite failed" },
      { id: "notifications", label: "Notifications" },
      { id: "notifications-saving", label: "Notifications saving" },
      { id: "notifications-saved", label: "Notifications saved" },
      { id: "notifications-error", label: "Notifications error" },
      { id: "whatsapp", label: "WhatsApp OTP" },
      { id: "whatsapp-failed", label: "WhatsApp failed" },
      { id: "suspended", label: "Account suspended" },
    ],
  },
  {
    match: (path) => path === "/billing",
    states: [{ id: "default", label: "E12 Billing" }],
  },
  {
    match: (path) => path === "/login",
    states: [
      { id: "default", label: "V07 Login" },
      { id: "verifying", label: "V07c Verifying" },
      { id: "incorrect", label: "V07d Incorrect" },
      { id: "expired", label: "V07e Expired" },
      { id: "locked", label: "V07h Locked" },
      { id: "network", label: "V07j Network" },
      { id: "suspended", label: "V07k Suspended" },
    ],
  },
];

export function statesForPath(path: string) {
  return ROUTE_STATES.find((entry) => entry.match(path))?.states ?? [];
}

export function verificationFromState(state: string): CompanyVerificationStatus | null {
  if (["verification-pending", "v08", "v08b", "v12", "v06", "v06b", "v10"].includes(state)) return "pending";
  if (state === "v09a" || state === "documents") return "additional_info_required";
  if (state === "v09b") return "rejected";
  if (state === "v11") return "verified";
  if (state === "not-started" || state === "gate") return "not_started";
  if (state === "v00" || state.startsWith("v0")) return "in_progress";
  return null;
}

export function accountFromState(state: string): AccountStatus | null {
  if (state === "suspended") return "Suspended";
  return null;
}
