"use client";

import { Briefcase, CalendarCheck, RefreshCw, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ApplicantBadge, JobBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { VerificationBanner } from "@/components/ui/verification-banner";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { PendingDecision } from "@/components/ui/pending-decision";
import { DASHBOARD_ACTIVE, EMPLOYER } from "@/lib/fixtures";
import { JOB_REVIEW_SLA_LABEL, PLAN_JOB_POST_LIMIT, SHOW_REFERENCE_ID, VERIFICATION_REFERENCE_ID, VERIFICATION_SLA_LABEL } from "@/src/config/policy";
import { formatRelative } from "@/lib/format";
import type { ApplicantStatus, JobStatus } from "@/lib/types";

const RECENT = [
  { id: "priya-verma", initials: "PV", name: "Priya Verma", role: "Architect", when: "2026-10-27", status: "New" as ApplicantStatus, tone: "bg-primary-primary-50 text-brand-primary" },
  { id: "amit-patel", initials: "AP", name: "Amit Patel", role: "Civil Engineer", when: "2026-10-25", status: "Interviewing" as ApplicantStatus, tone: "bg-secondary-secondary-50 text-secondary-secondary-700" },
  { id: "rahul-sharma", initials: "RS", name: "Rahul Sharma", role: "Civil Engineer", when: "2026-10-21", status: "Shortlisted" as ApplicantStatus, tone: "bg-success-success-50 text-success-success-700" },
];

export function DashboardView() {
  const router = useRouter();
  const { state, href, account } = usePortal();
  if (state === "loading") return <DashboardSkeleton />;
  if (state === "error") {
    return <ErrorState title="Couldn't load your dashboard" body="Check your connection and try again. Your jobs and applicants are safe." onRetry={() => router.push("/")} />;
  }
  if (state === "v08b") return <StatusCard />;
  if (state === "v09a") return <InfoRequest />;
  if (state === "v09b") return <Rejected />;

  const empty = state === "empty" || state === "suspended";
  const pending = state === "verification-pending" || state === "v12";
  const zeroMetrics = empty || pending;
  const applicants = state === "new-applicants" ? 9 : zeroMetrics ? 0 : 7;
  const views = zeroMetrics ? 0 : 1240;
  const interviews = zeroMetrics ? 0 : 3;
  const activeCount = state === "returned" ? 1 : zeroMetrics ? 0 : 2;
  const note =
    state === "pending-review" ? "+1 pending review" : state === "returned" ? "+1 returned" : pending ? "Drafts allowed" : undefined;

  const jobs =
    state === "pending-review"
      ? [
          ...DASHBOARD_ACTIVE,
          { id: "sales", title: "Sales Associate", employmentType: "Full-time" as const, location: "Raipur", views: 0, applicants: 0, status: "pending_review" as JobStatus },
        ]
      : state === "returned"
        ? [
            { ...DASHBOARD_ACTIVE[0], status: "returned" as JobStatus },
            DASHBOARD_ACTIVE[1],
          ]
        : pending
          ? [
              { id: "store-sales-associate", title: "Store Sales Associate", employmentType: "Full-time" as const, location: "Pandri, Raipur", views: 0, applicants: 0, status: "draft" as JobStatus },
              { id: "cashier", title: "Cashier", employmentType: "Full-time" as const, location: "Raipur", views: 0, applicants: 0, status: "draft" as JobStatus },
            ]
          : DASHBOARD_ACTIVE;

  return (
    <div className="space-y-[16px] ">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h1 className="text-subheading-semibold">Dashboard</h1>
        <div className="flex items-center gap-[8px]">
          <span className="inline-flex h-[40px] items-center gap-[8px] rounded-md border border-border-default bg-white px-[12px] text-body-sm-regular">
            <CalendarCheck size={16} /> Last 7 days
          </span>
          <button aria-label="Refresh" className="flex h-[40px] w-[40px] items-center justify-center rounded-md border border-border-default bg-white">
            <RefreshCw size={16} />
          </button>
          {empty ? (
            <Button variant="dark" href="/post-job">
              Post a job
            </Button>
          ) : null}
          {state === "plan-limit" ? (
            <Button variant="outline" disabled>
              Post a job
            </Button>
          ) : null}
          {pending ? (
            <Button variant="outline" href="/post-job">
              Post a job
            </Button>
          ) : null}
        </div>
      </div>

      {pending || state === "v12" ? (
        <VerificationBanner
          status={state === "v12" ? "pending" : "pending"}
          title="Company verification · Pending"
          body={
            <>
              We are checking your business details. You can save job drafts meanwhile; publishing unlocks once verified. Review time{" "}
              <PendingDecision value={VERIFICATION_SLA_LABEL} />.
            </>
          }
          action={
            <Button href="/?state=v08b" variant="primary" size="sm">
              View verification status
            </Button>
          }
        />
      ) : state === "suspended" ? null : (
        <div className="flex items-center justify-between rounded-lg bg-success-success-50 px-[20px] py-[16px]">
          <div>
            <p className="text-body-semibold text-success-success-700">Company verified</p>
            <p className="text-body-sm-regular text-text-secondary">Your company shows a verified badge to job seekers on Around Jobs.</p>
          </div>
        </div>
      )}

      {state === "pending-review" ? (
        <Banner
          tone="info"
          title='Job “Sales Associate” is pending review'
          body={
            <>
              We&apos;ll notify you when it goes live. Review time <PendingDecision value={JOB_REVIEW_SLA_LABEL} />.
            </>
          }
        />
      ) : null}
      {state === "returned" ? (
        <Banner
          tone="warning"
          title="Civil Engineer was returned for correction."
          body="Fix the flagged fields and resubmit it for review."
          action={<Button href="/jobs/office-admin?state=returned" size="sm">Fix and resubmit</Button>}
        />
      ) : null}
      {state === "expiring" ? (
        <Banner
          tone="warning"
          title="Civil Engineer expires in 2 days."
          body="Renew or extend it to keep receiving applicants."
          action={
            <div className="flex gap-[8px]">
              <Button variant="outline" size="sm">Extend</Button>
              <Button size="sm" href="/jobs/store-sales-associate">Renew job</Button>
            </div>
          }
        />
      ) : null}
      {state === "plan-limit" ? (
        <Banner
          tone="warning"
          title="You have reached the job-post limit on your plan."
          body={
            <>
              Included live posts <PendingDecision value={PLAN_JOB_POST_LIMIT} />. Upgrade to post more jobs.
            </>
          }
          action={<Button variant="outline" size="sm" href="/billing">Upgrade plan</Button>}
        />
      ) : null}
      {state === "v12" ? (
        <Banner tone="info" title="Manual review" body="This submission needs a person to review it. Drafts stay available while that happens." />
      ) : null}

      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={<Briefcase size={18} />} tint="bg-primary-primary-50 text-brand-primary" label="Active jobs" value={String(activeCount)} note={note} />
        <Stat icon={<Users size={18} />} tint="bg-secondary-secondary-50 text-secondary-secondary-700" label="New applicants" value={String(applicants)} delta={zeroMetrics ? undefined : state === "new-applicants" ? "+2 new" : "+4"} />
        <Stat icon={<TrendingUp size={18} />} tint="bg-features-features-50 text-features-features-500" label="Job views" value={views.toLocaleString("en-IN")} delta={zeroMetrics ? undefined : "+18%"} />
        <Stat icon={<CalendarCheck size={18} />} tint="bg-success-success-50 text-success-success-700" label="Interviews scheduled" value={String(interviews)} />
      </div>

      {pending ? (
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <div className="mb-[12px] flex items-center justify-between">
            <h2 className="text-body-semibold">Your drafts</h2>
            <Button href="/post-job" size="sm" variant="outline">New draft</Button>
          </div>
          {jobs.map((item) => (
            <div key={item.id} className="flex items-center gap-[12px] border-t border-border-default py-[12px]">
              <div className="min-w-[0px] flex-1">
                <p className="text-body-sm-semibold">{item.title}</p>
                <p className="text-label-regular text-text-secondary">Draft · saved recently</p>
              </div>
              <JobBadge status="draft" />
              <Button href={`/jobs/${item.id}?state=draft`} size="sm" variant="outline">Edit</Button>
            </div>
          ))}
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
          <section className="rounded-lg border border-border-default bg-white p-[16px]">
            <div className="mb-[12px] flex items-center justify-between">
              <h2 className="text-body-semibold">
                Recent applicants{" "}
                {state === "new-applicants" ? <span className="ml-[4px] rounded-full bg-primary-primary-50 px-[8px] py-[4px] text-label-medium text-brand-primary">2 new</span> : null}
              </h2>
              <Link href={href("/applicants")} className="text-body-sm-semibold text-brand-primary">View all →</Link>
            </div>
            {zeroMetrics ? (
              <EmptyState title="No applicants yet" body="Applicants will appear here once you post your first job." />
            ) : (
              <table className="w-full text-left text-body-sm-regular">
                <thead className="text-label-medium text-text-secondary">
                  <tr>
                    <th className="py-[8px] font-medium">Candidate</th>
                    <th className="font-medium">Applied for</th>
                    <th className="font-medium">Applied on</th>
                    <th className="font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT.map((person, index) => (
                    <tr key={person.id} className={state === "new-applicants" && index < 2 ? "bg-primary-primary-50" : ""}>
                      <td className="py-[8px]">
                        <Link href={`/applicants/${person.id}`} className="flex items-center gap-[8px] font-medium">
                          <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-label-medium ${person.tone}`}>{person.initials}</span>
                          {person.name}
                        </Link>
                      </td>
                      <td>{person.role}</td>
                      <td className="text-text-secondary">{formatRelative(person.when)}</td>
                      <td><ApplicantBadge status={person.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="rounded-lg border border-border-default bg-white p-[16px]">
            <div className="mb-[12px] flex items-center justify-between">
              <h2 className="text-body-semibold">Active jobs</h2>
              <Link href={href("/jobs")} className="text-body-sm-semibold text-brand-primary">Manage →</Link>
            </div>
            {empty ? (
              <EmptyState title="No active jobs" body="Post your first job to start receiving applications from nearby candidates." action={<Button href="/post-job">Post a job</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-body-sm-regular">
                  <thead className="text-label-medium text-text-secondary">
                    <tr>
                      <th className="py-[8px] font-medium">Job title</th>
                      <th className="font-medium">Type & Location</th>
                      <th className="font-medium">Views</th>
                      <th className="font-medium">Applicants</th>
                      <th className="font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((item) => (
                      <tr key={item.id} className="border-t border-border-default">
                        <td className="py-[12px] font-semibold">
                          <Link href={`/jobs/${item.id === "civil" || item.id === "architect" || item.id === "sales" ? "store-sales-associate" : item.id}`}>{item.title}</Link>
                        </td>
                        <td className="text-text-secondary">{item.employmentType} · {item.location}</td>
                        <td>{item.views}</td>
                        <td>{item.applicants}</td>
                        <td><JobBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      {account === "Suspended" ? null : null}
    </div>
  );
}

function Stat({ icon, tint, label, value, note, delta }: { icon: ReactNode; tint: string; label: string; value: string; note?: string; delta?: string }) {
  return (
    <div className="flex gap-[12px] rounded-lg border border-border-default bg-white p-[16px]">
      <div className={`flex h-[44px] w-[44px] items-center justify-center rounded-md ${tint}`}>{icon}</div>
      <div>
        <p className="text-label-medium text-text-secondary">{label}</p>
        <p className="text-display-small-semibold">{value}</p>
        {delta ? <p className="text-label-medium text-success-success-700">{delta} <span className="font-normal text-text-tertiary">vs last week</span></p> : null}
        {note ? <p className="text-label-regular text-text-secondary">{note}</p> : null}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-[16px] ">
      <SkeletonBlock className="h-[28px] w-[160px]" />
      <SkeletonBlock className="h-[64px] w-full" />
      <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="h-[96px]" />)}
      </div>
      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
        <SkeletonBlock className="h-[256px]" />
        <SkeletonBlock className="h-[256px]" />
      </div>
    </div>
  );
}

function StatusCard() {
  return (
    <div className="space-y-[16px] ">
      <h1 className="text-subheading-semibold">{EMPLOYER.companyName}</h1>
      <Banner
        tone="warning"
        title="Verification pending"
        body={
          <>
            Submitted 28 Oct 2026. Reference {SHOW_REFERENCE_ID ? VERIFICATION_REFERENCE_ID : null} <PendingDecision value={VERIFICATION_REFERENCE_ID} show={SHOW_REFERENCE_ID} />.
          </>
        }
      />
      <section className="rounded-lg border border-border-default bg-white p-[20px]">
        <Link href="/" className="text-body-sm-semibold text-brand-primary">← Back to portal</Link>
        <h2 className="mt-[16px] text-body-semibold">Verification request</h2>
        {[
          ["Status", "Pending"],
          ["Document type", "GST certificate"],
          ["Representative", "Work email"],
          ["Submitted", "28 Oct 2026"],
        ].map(([label, value]) => (
          <div key={label} className="mt-[12px] flex gap-[24px] text-body-sm-regular">
            <span className="w-[160px] text-text-secondary">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
        <div className="mt-[24px] grid gap-[16px] sm:grid-cols-3">
          <Step label="Submitted" detail="Done" />
          <Step label="In review" detail="Current" />
          <Step label="Decision" detail="Waiting" />
        </div>
      </section>
    </div>
  );
}

function Step({ label, detail }: { label: string; detail: string }) {
  return (
    <div>
      <p className="text-body-sm-semibold">{label}</p>
      <p className="text-label-regular text-text-secondary">{detail}</p>
    </div>
  );
}

function InfoRequest() {
  return (
    <div className="mx-auto max-w-[640px] space-y-[16px]">
      <h1 className="text-subheading-semibold">{EMPLOYER.companyName}</h1>
      <section className="rounded-lg border border-border-default bg-white p-[20px]">
        <Banner tone="warning" title="Additional information required" body="Upload a shop & establishment licence or a utility bill. The address on your GST certificate doesn't match the address you entered." />
        <p className="mt-[16px] text-body-sm-regular text-text-secondary">Your drafts are kept.</p>
        <div className="mt-[16px]"><Button href="/verification?state=v03">Upload document</Button></div>
      </section>
    </div>
  );
}

function Rejected() {
  return (
    <div className="mx-auto max-w-[640px] space-y-[16px]">
      <h1 className="text-subheading-semibold">{EMPLOYER.companyName}</h1>
      <section className="space-y-[12px] rounded-lg border border-border-default bg-white p-[20px]">
        <Banner tone="danger" title="Verification rejected" body={`The business name on the document doesn't match “${EMPLOYER.companyName}”.`} />
        <p className="text-body-sm-regular text-text-secondary">Fix your details or upload a different document, then resubmit. Your drafts are kept. Resubmit limits are still a pending policy decision.</p>
        <div className="flex flex-wrap gap-[8px]">
          <Button href="/verification?state=v01">Edit details & reapply</Button>
          <Button variant="outline" href="/help">Contact support</Button>
        </div>
      </section>
    </div>
  );
}
