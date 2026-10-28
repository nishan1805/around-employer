/**
 * Pending product rules for the employer portal.
 * Every value below is a placeholder. TODO: pending decision — do not treat
 * these as a committed SLA, file policy, auth rule, or billing price.
 */

export interface PolicyConfig {
  documents: {
    /** TODO: pending decision — accepted company and ID file types. */
    accept: readonly ["application/pdf", "image/jpeg", "image/png"];
    /** TODO: pending decision — human label for the accepted types. */
    acceptLabel: string;
    /** TODO: pending decision — maximum upload size in bytes. */
    maxBytes: number;
  };
  logo: {
    /** Logo guidance taken from the company profile frame, not a confirmed service limit. */
    maxBytes: number;
    accept: readonly ["image/jpeg", "image/png"];
  };
  review: {
    /** TODO: pending decision — company verification review-time copy. */
    verificationSlaLabel: string;
    /** TODO: pending decision — per-job review-time copy. */
    jobReviewSlaLabel: string;
  };
  otp: {
    /** TODO: pending decision — shared by phone OTP and work-email OTP. */
    length: number;
    /** TODO: pending decision — resend cooldown in seconds. Figma shows 0:30. */
    resendCooldownSeconds: number;
    /** TODO: pending decision — wrong codes before lockout. */
    maxAttempts: number;
    /** TODO: pending decision — resend requests before rate limit. */
    maxResends: number;
    /** TODO: pending decision — lockout duration in seconds. */
    lockoutSeconds: number;
    /** TODO: pending decision — code lifetime in seconds. */
    expirySeconds: number;
    /** Local demo code only. Not a secret and not part of the policy decision. */
    demoCode: string;
  };
  notifications: {
    /** TODO: pending decision — no provider is wired. Preferences are stored locally until a channel is chosen. */
    channels: readonly ["email", "in_app", "whatsapp"];
    /**
     * TODO: pending decision — which channels can actually deliver.
     * Email and in-app toggles are editable preferences. WhatsApp stays off until a number is verified.
     */
    channelAvailability: {
      email: "undecided";
      inApp: "undecided";
      whatsapp: "undecided";
    };
    /** TODO: pending decision — default time for the daily summary. */
    dailySummaryDefaultTime: string;
    /** TODO: pending decision — default lead time for job expiry reminders. */
    expiryReminderDefault: string;
  };
  accountClosure: {
    /** TODO: pending decision — what closing an employer account does. Shown as this note, not as invented outcomes. */
    note: string;
    /** The mock API cannot close an account. */
    supportedByMockApi: false;
  };
  teamAccess: {
    /** TODO: pending decision — per-role access copy for the Team members table. */
    byRole: {
      Owner: string;
      "Hiring manager": string;
      Recruiter: string;
    };
  };
  referenceId: {
    /** TODO: pending decision — verification reference ID format. */
    example: string;
    /** TODO: pending decision — whether the ID is shown before the scheme is approved. */
    showBeforeDecision: boolean;
  };
  plan: {
    /** TODO: pending decision — included live job posts on the current plan. */
    jobPostLimit: number;
    /** TODO: pending decision — free monthly live jobs. */
    freeJobAllowance: number;
    /** TODO: pending decision — credit pack prices are unset. */
    creditPacks: readonly { credits: number; blurb: string; priceLabel: string }[];
  };
}

export const policy: PolicyConfig = {
  documents: {
    accept: ["application/pdf", "image/jpeg", "image/png"],
    acceptLabel: "PDF, JPG or PNG",
    maxBytes: 5 * 1024 * 1024,
  },
  logo: {
    maxBytes: 2 * 1024 * 1024,
    accept: ["image/jpeg", "image/png"],
  },
  review: {
    verificationSlaLabel: "usually 1–2 working days",
    jobReviewSlaLabel: "usually within 24 hours",
  },
  otp: {
    length: 6,
    resendCooldownSeconds: 30,
    maxAttempts: 5,
    maxResends: 3,
    lockoutSeconds: 15 * 60,
    expirySeconds: 5 * 60,
    demoCode: "482913",
  },
  notifications: {
    channels: ["email", "in_app", "whatsapp"],
    channelAvailability: {
      email: "undecided",
      inApp: "undecided",
      whatsapp: "undecided",
    },
    dailySummaryDefaultTime: "9:00 AM",
    expiryReminderDefault: "3 days before expiry",
  },
  accountClosure: {
    note: "Pending decision",
    supportedByMockApi: false,
  },
  teamAccess: {
    byRole: {
      Owner: "All access",
      "Hiring manager": "Post jobs, manage applicants",
      Recruiter: "Manage applicants",
    },
  },
  referenceId: {
    example: "AR-VER-2026-00481",
    showBeforeDecision: false,
  },
  plan: {
    jobPostLimit: 3,
    freeJobAllowance: 2,
    creditPacks: [
      { credits: 5, blurb: "Good for a single branch", priceLabel: "₹ —" },
      { credits: 15, blurb: "Most popular for 2–3 branches", priceLabel: "₹ —" },
      { credits: 40, blurb: "For agencies and chains", priceLabel: "₹ —" },
    ],
  },
};

export const DOCUMENT_ACCEPT = policy.documents.accept;
export const DOCUMENT_ACCEPT_LABEL = policy.documents.acceptLabel;
export const DOCUMENT_MAX_BYTES = policy.documents.maxBytes;
export const LOGO_MAX_BYTES = policy.logo.maxBytes;
export const VERIFICATION_SLA_LABEL = policy.review.verificationSlaLabel;
export const JOB_REVIEW_SLA_LABEL = policy.review.jobReviewSlaLabel;
export const OTP_LENGTH = policy.otp.length;
export const OTP_RESEND_COOLDOWN_SECONDS = policy.otp.resendCooldownSeconds;
export const OTP_MAX_ATTEMPTS = policy.otp.maxAttempts;
export const OTP_MAX_RESENDS = policy.otp.maxResends;
export const OTP_LOCKOUT_SECONDS = policy.otp.lockoutSeconds;
export const OTP_EXPIRY_SECONDS = policy.otp.expirySeconds;
export const OTP_DEMO_CODE = policy.otp.demoCode;
export const NOTIFICATION_CHANNELS = policy.notifications.channels;
export const DAILY_SUMMARY_DEFAULT_TIME = policy.notifications.dailySummaryDefaultTime;
export const EXPIRY_REMINDER_DEFAULT = policy.notifications.expiryReminderDefault;
export const ACCOUNT_CLOSURE = policy.accountClosure;
export const TEAM_ACCESS = policy.teamAccess.byRole;
export const VERIFICATION_REFERENCE_ID = policy.referenceId.example;
export const SHOW_REFERENCE_ID = policy.referenceId.showBeforeDecision;
export const PLAN_JOB_POST_LIMIT = policy.plan.jobPostLimit;
export const FREE_JOB_ALLOWANCE = policy.plan.freeJobAllowance;
export const CREDIT_PACKS = policy.plan.creditPacks;
