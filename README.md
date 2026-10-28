# Around Jobs — employer portal

Employer-side web app for Around, a city discovery platform. Employers post jobs, review applicants, and verify their company. This milestone is a front end only. Data comes from typed fixtures behind `lib/api`. There is no live backend.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
npm run format
```

Requires Node 20+ (developed on Node 22).

## Stack

- Next.js App Router, TypeScript strict, Tailwind CSS v4
- UI primitives in `components/ui`, named to match the Figma components for a later Code Connect pass
- Tokens live in `src/styles/tokens/` (Figma export). See that folder’s README for naming and how `tailwind.config.ts` and `app/globals.css` load them.
- Pending product rules live only in `src/config/policy.ts`. Each one is marked TODO until the service decision lands.

## Structure

```
app/(portal)          Shell routes: dashboard, jobs, applicants, company, verification, settings, billing, help, search
app/(auth)/login      Employer login (no shell)
components/ui         Button, Input, Select, Banner, Verification Banner, Job Status Badge, Stage Chip, Step Indicator, Resume Upload, Confirm Dialog, Progress Bar
components/shell      Sidebar, navbar, dev state switcher
lib/api               Mock services. Replace the function bodies when the API exists.
lib/fixtures.ts       Sample jobs, applicants, and company
src/config/policy.ts  File limits, SLAs, OTP, channels, reference ID
src/styles/tokens.css Colours, radii, type roles
docs/HANDOFF.md       Screen states and copy
```

## Routes

| Path | Screen |
| --- | --- |
| `/` | Dashboard |
| `/post-job` | Post a job wizard (Figma E08) |
| `/jobs` | My Jobs |
| `/jobs/[id]` | Job details |
| `/jobs/[id]/applicants` | Applicants for one job |
| `/applicants` | All applicants |
| `/applicants/[id]` | Candidate overview and resume |
| `/company` | Company profile |
| `/verification` | Company verification |
| `/billing` | Job credits |
| `/settings` | Account, team, notifications, security |
| `/help` | Help & support |
| `/search` | Navbar city search |
| `/login` | Employer login |

Sidebar and navbar items all go to one of these routes. Logout goes to `/login`.

## States

Append `?state=` to open a Figma state. In `npm run dev`, a **States** panel lists them and can also set `account` (`Active` | `Suspended`) and `verification` (`not_started` | `in_progress` | `pending` | `verified` | `additional_info_required` | `rejected`).

A job can be submitted for review only when verification is `verified` and the account is `Active`. While verification is `pending`, the dashboard shows no live-job metrics. The suspended-account banner is separate from the verification banner.

The login and verification demo code is `482913` (see `policy.otp.demoCode`). It is not a credential.

## Status fields

These three fields are independent:

- Account: `Active` | `Suspended`
- Company verification: `not_started` | `in_progress` | `pending` | `verified` | `additional_info_required` | `rejected`
- Job: `draft` | `pending_review` | `active` | `returned` | `paused` | `expired` | `closed`
