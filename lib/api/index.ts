import { APPLICANTS, COMPANY, JOBS, NOTIFICATIONS, SETTINGS, TEAM } from "@/lib/fixtures";
import type {
  AccountSettings,
  Applicant,
  AppNotification,
  CompanyProfile,
  Job,
  TeamMember,
} from "@/lib/types";

/**
 * Typed mock services. Each function is the swap point for a real Around Jobs
 * endpoint. Nothing here calls a network API.
 */

async function mock<T>(value: T): Promise<T> {
  return structuredClone(value);
}

/** TODO: replace with GET /employer/jobs */
export function listJobs(): Promise<Job[]> {
  return mock(JOBS);
}

/** TODO: replace with GET /employer/jobs/:id */
export function getJob(id: string): Promise<Job | null> {
  return mock(JOBS.find((job) => job.id === id) ?? null);
}

/** TODO: replace with POST /employer/jobs */
export function createJobDraft(input: Job): Promise<Job> {
  return mock(input);
}

/** TODO: replace with POST /employer/jobs/:id/submit */
export function submitJob(id: string): Promise<{ id: string; status: "pending_review" }> {
  return mock({ id, status: "pending_review" });
}

/** TODO: replace with GET /employer/applicants */
export function listApplicants(): Promise<Applicant[]> {
  return mock(APPLICANTS);
}

/** TODO: replace with GET /employer/applicants/:id */
export function getApplicant(id: string): Promise<Applicant | null> {
  return mock(APPLICANTS.find((applicant) => applicant.id === id) ?? null);
}

/** TODO: replace with GET /employer/company */
export function getCompany(): Promise<CompanyProfile> {
  return mock(COMPANY);
}

/** TODO: replace with PUT /employer/company */
export function saveCompany(profile: CompanyProfile): Promise<CompanyProfile> {
  return mock(profile);
}

/** TODO: replace with GET /employer/notifications */
export function listNotifications(): Promise<AppNotification[]> {
  return mock(NOTIFICATIONS);
}

/** TODO: replace with GET /employer/settings */
export function getSettings(): Promise<{ account: AccountSettings; team: TeamMember[] }> {
  return mock({ account: SETTINGS, team: TEAM });
}

/**
 * TODO: replace with POST /employer/verification.
 * The body is intentionally loose until the verification API contract is decided.
 */
export function submitVerification(payload: unknown): Promise<{ referenceId: string; status: "pending" }> {
  void payload;
  return mock({ referenceId: "AR-VER-2026-00481", status: "pending" });
}
