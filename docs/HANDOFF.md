# Employer portal handoff

Copy below is what the UI shows. Rules that are still undecided (file types and size, review time, OTP cooldown / attempts / lockout, notification channels, reference ID format) are read from `src/config/policy.ts` and marked TODO there. Do not hard-code replacements in the screens.

Demo OTP code, local only: `482913`.

## Shell

- Sidebar: Dashboard, Post a Job, My Jobs, Applicants, Company Profile, Billing, Settings, Help & Support, Logout.
- Top bar: page title, Post a Job, notifications, and the Raipur Builder account menu (Company profile, Billing, Settings, Help, Logout). The sidebar width and top bar height stay fixed. Page content sits in a centred column with 32px side padding: 1440px for list and table pages, 1280px otherwise, 768px for Post a Job, and 1040px for Settings.
- Account `Suspended`: red account banner on every portal page. It is not the verification banner. Posting and publishing stay locked. Drafts can still be edited.
- Dev panel (`npm run dev`): `?state=`, `?account=`, `?verification=`.

## Dashboard `/`

| State | What you see |
| --- | --- |
| `default` (E00) | “Company verified”. Stats 2 / 7 / 1,240 / 3. Recent applicants and active jobs. |
| `pending-review` (E00b) | Info banner: Job “Sales Associate” is pending review. Active jobs note “+1 pending review”. |
| `empty` (E00c) | Verified banner. All stats 0. “No applicants yet”. “No active jobs” + Post a job. |
| `verification-pending` (E00d / V08) | Verification banner, status Pending. Stats are zeros. Drafts list. Action: “View verification status”. Publishing locked. |
| `returned` (E00e) | “Civil Engineer was returned for correction.” Active jobs 1, “+1 returned”. |
| `expiring` (E00f) | “Civil Engineer expires in 2 days.” Extend / Renew job. |
| `plan-limit` (E00g) | Job-post limit reached. The included count is shown as Pending decision (`policy.plan.jobPostLimit`). Upgrade plan. |
| `notifications` (E00h) | Notifications panel open. “Mark all as read”. |
| `account-menu` (E00i) | Account menu: Raipur Builder, hiring@raipurbuilder.in. |
| `loading` (E00j) | Skeleton. |
| `error` (E00k) | “Couldn't load your dashboard”. “Check your connection and try again. Your jobs and applicants are safe.” Retry. |
| `new-applicants` (E00l) | New applicants 9, “+2 new”, two highlighted rows. |
| `suspended` (A12) | Account banner. Empty metrics. Post a job locked. |
| `v08b` | Verification request. Reference ID from policy. Timeline: Submitted, In review, Decision. |
| `v09a` | “Additional information required” plus the GST address mismatch copy. “Your drafts are kept.” |
| `v09b` | “Verification rejected”. “Edit details & reapply” and “Contact support”. |
| `v12` | Pending banner plus “Manual review”. |

Validation: none on this page. Empty: E00c and the pending drafts/zero metrics. Loading and error: E00j, E00k.

## My Jobs `/jobs`

| State | What you see |
| --- | --- |
| `default` | Tabs All, Active, Drafts, Pending Review, Returned, Paused, Expired, Closed. Table of 48 jobs, 10 per page. |
| `returned` | Returned tab. “N jobs were returned for correction…” Each row has its reason and “Fix and resubmit”. |
| `actions` | Row menu open (Resume, Edit, Close, Duplicate, Delete — items depend on status). |
| `empty` | “No jobs posted yet”. “Post your first job to start receiving applicants.” |
| `no-results` | Search “Barista”, location Bhilai. “No jobs match your search”. “Clear filters”. |

Confirm dialogs: pause, resume, renew, close, delete. Close copy notes a credit is not refunded.

Validation: search and location filters only. Loading/error are not separate frames; the list is local fixture data.

## Job details `/jobs/[id]`

| State | Banner / actions |
| --- | --- |
| `active` (E13a) | View applicants, actions menu (View applicants, Edit, Pause, Duplicate, Close job). |
| `pending-review` (E13b) | “This job is under review.” Edit and Pause disabled. |
| `returned` (E13c) | Reviewer note with salary range and job description. “Fix and resubmit”. |
| `paused` (E13d) | “This job is paused.” Resume job. |
| `closed` (E13e) | “This job is closed.” |
| `expired` (E13f) | “This job has expired.” Renew job. |
| `draft` (E13g) | “This job is a draft.” Submit for review, or the verification gate if the company is not verified. |
| `actions` (E13h) | Actions menu open. |
| `loading` (E13i) | Skeleton. |
| `error` (E13j) | “Couldn't load job details”. “Check your connection and try again.” Retry. |

## Post a job `/post-job`

Figma frames are E08a choose, E08b paste, E08c processing, E08e extract failed, E08f AI-filled details, E08g manual details, E08h pay, E08i review, and E08j submit confirm. There is no E08d.

| State | Frame | Copy |
| --- | --- | --- |
| `choose` | E08a | “Post a job”. Paste a description, or enter details manually. Nothing goes live until review. |
| `paste` | E08b | “Paste a job description”. Extract stays disabled under 20 characters. “Your text is saved as you go.” |
| `processing` | E08c | “Extracting job details…”. Analysing description / Identifying key details / Preparing form. “Use manual entry”. |
| `extract-failed` | E08e | “We couldn’t extract the job details”. Tips: include title, location, responsibilities and salary; use a clear description; avoid images or scans. Try again / Create manually. |
| `details` / `details-invalid` | E08g | Step indicator: Job details, Pay & requirements, Review. Required: title, category, location, description. Invalid state shows those errors. |
| `details-ai` | E08f | Same form, filled from the pasted description. |
| `pay` | E08h | Salary type Fixed or Range. Salary required. Range also needs a maximum. Benefits optional. |
| `review` | E08i | Summary with Edit links. |
| `confirm` | E08j | “Submit for review?” Job becomes `pending_review`. |
| `gate` | “Verification gate”. Submit disabled. “Continue verification”. Same block when account is Suspended or verification is not `verified`. |

Save draft is allowed on the form steps and writes a `draft` job. It does not submit for review.

## Applicants `/applicants`

| State | Copy |
| --- | --- |
| `default` | Tabs All, New, Shortlisted, Interviewing, Hired, Rejected. |
| `no-results` | Search “UX designer”. “No applicants match your search”. “Clear filters”. |
| `loading` | Skeleton rows. |
| `error` | “Couldn't load applicants”. “Check your connection and try again. Your search and filters are kept.” Retry. |

`/jobs/[id]/applicants` is the split list. Actions: Shortlist, Schedule interview, Reject. Notes save on Enter. Empty: “No applicants yet”. Resume area: “Resume PDF preview (placeholder)”.

Stage chip label for `Rejected` is “Not selected”. The filter tab stays “Rejected”.

## Candidate `/applicants/[id]`

Featured record: Amit Sharma (`/applicants/amit-sharma`).

| State | Copy |
| --- | --- |
| `overview` (E10a) | Header, stage chip, Change status, Download resume. Skills, experience, education, notes, application details, about, links. |
| `resume` (E10b) | Page 1–3 of the text preview. Previous / Next. |
| `no-resume` | “No resume was uploaded with this application.” |
| `unsupported` | “This file type can’t be previewed.” |
| `resume-error` | “Couldn't load the resume”. Retry. |
| `loading` (E10c) | Skeleton. |
| `error` (E10d) | “Couldn't load this candidate”. Retry. |

Change status writes New, Shortlisted, Interviewing, Hired, or Rejected. Notes: “Add a private note”. Download builds a local text file. TODO: the real file comes from storage.

## Company profile `/company`

| State | Copy |
| --- | --- |
| `default` (E05) | Logo, basic info, about (500), location, hours, links. “Preview profile”. |
| `errors` | “Company name is required”. “Add a short description”. Industry, location, and hours are also required on save. |
| `unsaved` | “You have unsaved changes.” Cancel restores the last save. Save does not run by itself. |
| `preview` | 448px drawer over a 40% scrim. “This preview uses your unsaved edits and does not save them.” |
| `documents` (E11) | Verification documents. GST uploaded, others empty, shop licence at 60%, other failed (“connection lost”). Approval status card. |

Logo: JPG or PNG. The byte limit stays in `policy.logo` and the screen shows Pending decision. Remove clears the image back to initials.

## Verification `/verification`

Progress: Company, Mobile, Company proof, Representative, Review.

| State | Copy / rule |
| --- | --- |
| `v01` | “Tell us about your business”. Found on Google. Continue needs name, contact, address, category. |
| `v01-loading` | “Looking up your business on Google…” |
| `v01-failed` | “We couldn’t reach Google…” |
| `v01-none` | “No listing found…” |
| `v01-manual` | Empty address and category. |
| `v02` | 6 boxes. Verify disabled until 6 digits. Resend cooldown from policy. |
| `v02-partial` | Three digits, Verify disabled. |
| `v02-verifying` | “Verifying…” |
| `v02-incorrect` | “That code is incorrect.” |
| `v02-expired` | “This code expired…” |
| `v02-rate-limited` | “Too many resend requests.” |
| `v02-locked` | “Too many attempts. Verification is locked…” |
| `v02-network` | “Couldn’t reach the verification service.” |
| `v03` | Document type list: GST, Company PAN, CIN / registration, Shop & Establishment, FSSAI, Other. |
| `v03-types` | Type menu open. |
| `v03-uploading` / `uploaded` / `failed` / `cancelled` | Resume Upload states. |
| `v03-other` | “Other documents are sent for manual review.” |
| `v04` | Work email (recommended) or PAN/Aadhaar. ID consent starts unticked. |
| `v04-partial` / `incorrect` / `expired` / `verified` | Email code states. |
| `v04-id` / `v04-id-invalid` / `v04-id-uploaded` | ID upload. Invalid copy does not state the byte limit as a fact; the limit stays in `policy.documents`. |
| `v05` | Review rows and Edit. Consent required. Submit disabled until it is ticked. |
| `v05-submitting` | “Submitting…”. Edits disabled. |
| `v05-failed` | “Couldn’t submit. Check your connection and try again. Your entries are kept.” |
| `v06` | “Submitted for verification”. |
| `v06b` | Same, plus the manual-review note. |
| `v10` | “Resubmitted for review”. “Your drafts are kept.” |
| `v11` | “Your company is verified”. “You can now submit jobs for review.” |
| `v00` | “You can finish this later”. Closing the wizard keeps the in-progress draft. |

Phone ending in `0000`, or a company name containing “fail”, forces the network / submit failure in the mock.

## Settings `/settings`

Employer account is Raipur Builder (`hiring@raipurbuilder.in`). Team rows use that domain. There is no password.

Tabs: Account, Team members, Notifications. One column.

| State | What you see |
| --- | --- |
| `default` | Personal account. Role is read-only. Email and phone show Verified. Save changes is disabled until a field changes. |
| `account-invalid` | “Enter your name.” “Enter a valid email address.” |
| `account-saving` | Button reads “Saving…”. |
| `account-saved` | “Account details saved.” |
| `account-error` | “Couldn't save your account. Nothing was changed.” |
| `change-number` / `change-number-error` | OTP dialog. Verify stays disabled until 6 digits. Failure: “Couldn't verify that number.” |
| `close-confirm` | Confirm dialog lists only `policy.accountClosure.consequences`. |
| `close-unavailable` | “Closing an account is unavailable. The mock API does not support it.” |
| `team` | Table. Owner row has no actions. |
| `team-menu` / `team-pending-menu` | Kebab: edit role and remove, or resend and cancel invite. |
| `team-remove-confirm` | Remove confirmation. |
| `team-invite-invalid` / `submitting` / `success` / `error` | Invite card states. Success stays Pending and is not delivered. |
| `notifications` | Preference rows. No green strip until a save succeeds. |
| `notifications-saving` | “Saving…”. |
| `notifications-saved` | “Your preferences are saved automatically.” |
| `notifications-error` | “Couldn't save preferences.” |
| `whatsapp` / `whatsapp-failed` | Add-number OTP. The WhatsApp switch stays disabled until the number is verified. |
| `suspended` | Account banner. Edits locked. |

Daily summary time defaults to `policy.notifications.dailySummaryDefaultTime` (9:00 AM). Expiry reminders default to `policy.notifications.expiryReminderDefault` (3 days before expiry). Both show a Pending decision tag. “Learn about roles” links to Help. Access copy is shown in the cells; only the Access header carries the Pending decision tag. Branch access is omitted because team records do not have it. The hiring address is `HIRING_EMAIL` in `src/config/employer.ts`.

## Billing `/billing`

Credit balance “4 job credits”. Free allowance and the live-post limit show as Pending decision (`policy.plan`). Pack prices are “₹ —”. History table. Buy pack does not charge.

## Help `/help`

Four topic cards. Contact form. Success says the message was saved on this device and marks delivery as Pending decision. Email and message are required.

## Login `/login`

“Log in with the mobile number you verified.” Send OTP, 6 boxes, Verify disabled until 6 digits.

| State | Copy |
| --- | --- |
| `verifying` | “Verifying…” |
| `incorrect` | “That code is incorrect.” |
| `expired` | “This code has expired.” |
| `locked` | Lockout sentence from policy. |
| `network` | “Network error. Try again.” |
| `suspended` | “This account is suspended. Contact support.” |

“Register your business” opens `/verification`.
