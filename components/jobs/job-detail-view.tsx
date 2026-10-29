"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Eye, MapPin, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banner, ErrorState, SkeletonBlock } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate, formatInr } from "@/lib/format";
import { PendingDecision } from "@/components/ui/pending-decision";
import { JOB_REVIEW_SLA_LABEL } from "@/src/config/policy";
import { canSubmitJobForReview } from "@/lib/status";
import type { Job, JobStatus } from "@/lib/types";

const STATE_STATUS: Record<string, JobStatus> = {
  active: "active",
"pending-review": "pending_review",
  returned: "returned",
  paused: "paused",
  closed: "closed",
  expired: "expired",
  draft: "draft",
  actions: "active",
};

export function JobDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { jobs, state, patchJob, duplicateJob, account, verification } = usePortal();
  const [menu, setMenu] = useState(state === "actions");
  const found = jobs.find((item) => item.id === id) ?? jobs[0];
  if (state === "loading") {
    return (
      <div className="space-y-[16px] ">
        <SkeletonBlock className="h-[32px] w-[256px]" />
        <SkeletonBlock className="h-[96px] w-full" />
        <SkeletonBlock className="h-[256px] w-full" />
      </div>
    );
  }
  if (state === "error" || !found) {
    return <ErrorState title="Couldn't load job details" body="Check your connection and try again." onRetry={() => router.push(`/jobs/${id}`)} />;
  }
  const status = STATE_STATUS[state] ?? found.status;
  const job: Job = {
    ...found,
    status,
    returnedOn: status === "returned" ? found.returnedOn ?? "2026-10-27" : found.returnedOn,
    submittedOn: status === "pending_review" ? "2026-10-27" : found.submittedOn,
    returnReasons:
      status === "returned"
        ? found.returnReasons ?? [
            { field: "Salary range", message: "Range is below the minimum wage for Raipur. Update the monthly salary." },
            { field: "Job description", message: "Remove the phone number from the description. Candidates apply through Around." },
          ]
        : found.returnReasons,
  };

  return (
    <div className="space-y-[16px] ">
      <p className="flex items-center gap-[4px] text-body-sm-regular text-text-secondary">
        <Link href="/jobs" className="inline-flex items-center gap-[4px] font-medium text-text-primary"><ChevronLeft size={16} /> My Jobs</Link>
        <ChevronRight size={14} />
        <span className="max-w-[72ch] truncate text-text-primary">{job.title}</span>
      </p>
      {status === "pending_review" ? (
        <Banner
          tone="info"
          title="This job is under review."
          body={
            <>
              Editing and pausing are unavailable until review is complete. Review time <PendingDecision value={JOB_REVIEW_SLA_LABEL} />.
            </>
          }
        />
      ) : null}
      {status === "returned" ? (
        <Banner tone="warning" title="Returned for correction" body="The salary range and job description need changes before this job can go live." />
      ) : null}
      {status === "paused" ? <Banner tone="warning" title="This job is paused." body="Candidates cannot apply until you resume it." /> : null}
      {status === "expired" ? <Banner tone="danger" title="This job has expired." body="Renew it to start receiving applicants again." /> : null}
      {status === "closed" ? <Banner tone="info" title="This job is closed." body="It is no longer visible to job seekers." /> : null}
      {status === "draft" ? <Banner tone="info" title="This job is a draft." body="Submit it for review when your company is verified and your account is active." /> : null}

      <div className="flex flex-wrap items-start justify-between gap-[12px] rounded-lg border border-border-default bg-white p-[20px]">
        <div>
          <div className="flex flex-wrap items-center gap-[8px]">
            <h1 className="text-display-small-semibold">{job.title}</h1>
            <JobBadge status={status} />
          </div>
          <p className="mt-[4px] flex flex-wrap items-center gap-[4px] text-body-sm-regular text-text-secondary">
            <span>Job ID #{job.code}</span>
            <MapPin size={14} />
            <span>{job.location} · {job.category} · {job.employmentType} ·{" "}</span>
            {status === "pending_review" ? `Submitted on ${formatDate(job.submittedOn)}` : status === "returned" ? `Returned on ${formatDate(job.returnedOn)}` : `Posted on ${formatDate(job.postedOn)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {status === "active" ? <Button href={`/jobs/${job.id}/applicants`}>View applicants <ArrowRight size={16} /></Button> : null}
          {status === "pending_review" ? (
            <>
              <Button variant="outline" disabled>Edit job</Button>
              <Button variant="outline" disabled>Pause job</Button>
            </>
          ) : null}
          {status === "returned" || status === "draft" ? (
            <Button
              href={canSubmitJobForReview(account, verification) ? `/post-job?state=review&job=${job.id}` : "/post-job?state=gate"}
            >
              {status === "returned" ? "Fix and resubmit" : "Submit for review"}
            </Button>
          ) : null}
          {status === "paused" ? <Button onClick={() => patchJob(job.id, { status: "active" })}>Resume job</Button> : null}
          {status === "expired" ? <Button onClick={() => patchJob(job.id, { status: "active" })}>Renew job</Button> : null}
          {status === "active" ? (
            <div className="relative">
              <button aria-label="More actions" className="flex h-[44px] w-[44px] items-center justify-center rounded-sm border border-border-default" onClick={() => setMenu((open) => !open)}>
                <MoreHorizontal size={18} />
              </button>
              {menu ? (
                <div className="absolute right-[0px] z-20 mt-[8px] w-[176px] rounded-md border border-border-default bg-white py-[4px] shadow-lg">
                  <Link className="block px-[12px] py-[8px] text-body-sm-regular" href={`/jobs/${job.id}/applicants`}>View applicants</Link>
                  <Link className="block px-[12px] py-[8px] text-body-sm-regular" href={`/post-job?state=details&job=${job.id}`}>Edit job</Link>
                  <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular" onClick={() => patchJob(job.id, { status: "paused" })}>Pause</button>
                  <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular" onClick={() => duplicateJob(job.id)}>Duplicate</button>
                  <button className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular text-error-default" onClick={() => patchJob(job.id, { status: "closed" })}>Close job</button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {status === "returned" && job.returnReasons ? (
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-subheading-semibold">Reviewer note</h2>
          <p className="mt-[4px] text-body-sm-regular text-text-secondary">Fix these fields and resubmit. Your job goes back to review after you resubmit.</p>
          <ul className="mt-[12px] space-y-[8px] text-body-sm-regular">
            {job.returnReasons.map((reason) => (
              <li key={reason.field}>
                <span className="font-semibold text-brand-primary">{reason.field} → </span>
                {reason.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex items-center gap-[32px] rounded-lg border border-border-default bg-white px-[24px] py-[24px]">
        <div className="flex items-center gap-[16px]">
          <span className="flex size-[48px] items-center justify-center rounded-md bg-primary-primary-50 text-brand-primary"><Eye size={20} /></span>
          <div>
            <p className="text-label-medium text-text-secondary">Views</p>
            <p className="text-display-small-semibold">{job.views}</p>
          </div>
        </div>
        <span className="h-[48px] w-px bg-border-default" aria-hidden />
        <div className="flex items-center gap-[16px]">
          <span className="flex size-[48px] items-center justify-center rounded-md bg-primary-primary-50 text-brand-primary"><Users size={20} /></span>
          <div>
            <p className="text-label-medium text-text-secondary">Applicants</p>
            <p className="text-display-small-semibold">{job.applicants}</p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-[16px] lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <section className="h-fit rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-subheading-semibold">Job Description</h2>
          <p className="mt-[12px] max-w-[72ch] text-body-sm-regular text-text-secondary">{job.description}</p>
          <div className="my-[16px] border-t border-border-default" />
          <h3 className="text-body-semibold">Skills</h3>
          <div className="mt-[8px] flex flex-wrap gap-[8px]">
            {job.skills.map((skill) => (
              <span key={skill} className="rounded-full border border-border-default px-[12px] py-[4px] text-label-medium">{skill}</span>
            ))}
          </div>
        </section>
        <div className="space-y-[16px]">
          <section className="rounded-lg border border-border-default bg-white p-[20px]">
            <h2 className="text-subheading-semibold">Job Details</h2>
            <Detail label="Number of openings" value={String(job.openings)} />
            <Detail label="Work arrangement" value={job.workArrangement} />
            <Detail label="Experience" value={job.experience} />
            <Detail label="Education" value={job.education} />
          </section>
          <section className="rounded-lg border border-border-default bg-white p-[20px]">
            <h2 className="text-subheading-semibold">Compensation</h2>
            <Detail label="Salary type" value={job.salaryType} />
            <Detail label="Monthly salary" value={formatInr(job.monthlySalary)} />
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-[16px] border-b border-border-default py-[12px] text-body-sm-regular last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
