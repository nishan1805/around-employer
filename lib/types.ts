export type AccountStatus = "Active" | "Suspended";

export type CompanyVerificationStatus =
  | "not_started"
  | "in_progress"
  | "pending"
  | "verified"
  | "additional_info_required"
  | "rejected";

export type JobStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "returned"
  | "paused"
  | "expired"
  | "closed";

export type ApplicantStatus = "New" | "Shortlisted" | "Interviewing" | "Hired" | "Rejected";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkArrangement = "On-site" | "Hybrid" | "Remote";
export type SalaryType = "Fixed salary" | "Salary range";

export interface ReturnReason {
  field: string;
  message: string;
}

export interface Job {
  id: string;
  code: string;
  title: string;
  location: string;
  category: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  status: JobStatus;
  views: number;
  applicants: number;
  postedOn: string | null;
  submittedOn?: string | null;
  returnedOn?: string | null;
  expiresOn?: string | null;
  description: string;
  skills: string[];
  openings: number;
  experience: string;
  education: string;
  salaryType: SalaryType;
  monthlySalary: number;
  salaryMax?: number;
  benefits: string[];
  genderPreference?: string;
  minimumAge?: string;
  startDate?: string;
  deadline?: string;
  returnReasons?: ReturnReason[];
  listReason?: string;
}

export interface Note {
  id: string;
  author: string;
  at: string;
  text: string;
}

export interface ExperienceItem {
  title: string;
  org: string;
  dates: string;
  description: string;
}

export interface CandidateDetail {
  about: string;
  skills: string[];
  experienceItems: ExperienceItem[];
  education: { degree: string; school: string; dates: string };
  employmentPreference: string;
  noticePeriod: string;
  source: string;
  links: { label: string; href: string }[];
  resume: { fileName: string; pages: { heading: string; body: string }[] } | null;
}

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  jobId: string;
  jobTitle: string;
  status: ApplicantStatus;
  appliedOn: string;
  experience: string;
  location: string;
  phone: string;
  email: string;
  avatarTone: "blue" | "orange" | "green" | "purple" | "pink";
  highlightNew?: boolean;
  notes: Note[];
  detail?: CandidateDetail;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
  workplaceLocation: string;
  workingHours: string;
  website: string;
  linkedin: string;
  instagram: string;
  logoInitials: string;
  logoDataUrl: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  tone: "applicant" | "approved" | "returned" | "expiring";
}

export type TeamRole = "Owner" | "Hiring manager" | "Recruiter";
export type TeamStatus = "Active" | "Pending";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
  initials: string;
  you?: boolean;
}

export interface ChannelPref {
  email: boolean;
  inApp: boolean;
}

export interface NotificationPrefs {
  newApplicant: ChannelPref;
  dailySummary: { email: boolean; sendAt: string };
  whatsapp: { enabled: boolean; phone: string; verified: boolean };
  expiryReminders: ChannelPref & { remindMe: string };
  productUpdates: ChannelPref;
  billing: ChannelPref;
}

export interface AccountSettings {
  name: string;
  role: TeamRole;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  companyName: string;
  prefs: NotificationPrefs;
}

export type DocumentKind =
  | "gst"
  | "pan"
  | "cin"
  | "shop"
  | "fssai"
  | "other";

export interface VerificationFile {
  name: string;
  size: number;
  type: string;
}

export type LoadState = "ready" | "loading" | "error";
