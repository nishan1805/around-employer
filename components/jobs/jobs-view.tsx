"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JobBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate } from "@/lib/format";
import { JOB_STATUS_LABEL, canSubmitJobForReview } from "@/lib/status";
import type { Job, JobStatus } from "@/lib/types";

const TABS: { id: "all" | JobStatus; label: string }[] = [
  { id: "all", label: "All Jobs" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Drafts" },
  { id: "pending_review", label: "Pending Review" },
  { id: "returned", label: "Returned" },
  { id: "paused", label: "Paused" },
  { id: "expired", label: "Expired" },
  { id: "closed", label: "Closed" },
];

export function JobsView() {
  const router = useRouter();
  const { jobs, state, patchJob, removeJob, duplicateJob, account, verification } = usePortal();
  const [tab, setTab] = useState<"all" | JobStatus>(state === "returned" ? "returned" : "all");
  const [clearedEmpty, setClearedEmpty] = useState(false);
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(state === "actions" ? "front-desk" : state === "returned" ? null : null);
  const [confirm, setConfirm] = useState<{ id: string; action: "pause" | "resume" | "close" | "delete" | "renew" } | null>(null);
  const pageSize = 10;

  const source = useMemo(() => (state === "empty" ? [] : jobs), [jobs, state]);
  const counts = useMemo(() => {
    const base = { all: source.length } as Record<string, number>;
    for (const item of source) base[item.status] = (base[item.status] ?? 0) + 1;
    return base;
  }, [source]);

  const filtered = state === "no-results" && !clearedEmpty ? [] : source.filter((job) => tab === "all" || job.status === tab);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const openMenu = state === "returned" ? rows.find((job) => job.title === "Kitchen Helper")?.id ?? menuFor : menuFor;

  function runConfirm() {
    if (!confirm) return;
    if (confirm.action === "delete") removeJob(confirm.id);
    if (confirm.action === "pause") patchJob(confirm.id, { status: "paused" });
    if (confirm.action === "resume" || confirm.action === "renew") patchJob(confirm.id, { status: "active" });
    if (confirm.action === "close") patchJob(confirm.id, { status: "closed" });
    setConfirm(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <h1 className="text-subheading-semibold">My Jobs</h1>
          <p className="text-body-sm-regular text-text-secondary">Manage all your job listings, track performance, and take actions.</p>
        </div>
        <Button href="/post-job">Post a Job</Button>
      </div>
      {tab === "returned" && counts.returned ? (
        <p className="mt-[16px] rounded-md bg-warning-warning-50 px-[16px] py-[12px] text-body-sm-regular text-warning-warning-700">
          {counts.returned} jobs were returned for correction. Review the reason on each job, fix it and resubmit.
        </p>
      ) : null}
      <div className="mt-[16px] flex flex-wrap gap-x-[16px] gap-y-[8px] border-b border-border-default">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              setPage(1);
            }}
            className={`shrink-0 border-b-2 pb-[8px] text-body-sm-regular ${tab === item.id ? "border-brand-primary font-semibold text-brand-primary" : "border-transparent text-text-secondary"}`}
          >
            {item.label} <span className="text-label-regular">{counts[item.id] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="mt-[16px] overflow-hidden rounded-lg border border-border-default bg-white">
        {source.length === 0 ? (
          <EmptyState title="No jobs posted yet" body="Post your first job to start receiving applicants." action={<Button href="/post-job">Post a Job</Button>} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="search"
            title="No jobs match your search"
            body="Try a different keyword or remove a filter."
            action={
              <Button
                variant="outline"
                onClick={() => setClearedEmpty(true)}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
            <table className="w-full text-left text-body-sm-regular">
              <thead className="bg-background-secondary text-label-medium text-text-secondary">
                <tr>
                  {["Job", "Location", "Category", "Employment Type", "Status", "Views", "Applicants", "Posted On", ""].map((label) => (
                    <th key={label} className={`px-[16px] py-[12px] font-medium ${label === "Job" ? "" : "whitespace-nowrap"}`}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id} className="border-t border-border-default">
                    <td className="px-[16px] py-[12px] break-words">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-brand-primary">{job.title}</Link>
                      {job.listReason && job.status === "returned" ? (
                        <p className="text-label-regular text-error-default">
                          {job.listReason}{" "}
                          <Link href={`/jobs/${job.id}?state=returned`} className="font-medium">Fix and resubmit →</Link>
                        </p>
                      ) : null}
                    </td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap text-text-secondary">{job.location}</td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap">{job.category}</td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap">{job.employmentType}</td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap"><JobBadge status={job.status} /></td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap">{job.views}</td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap">{job.applicants}</td>
                    <td className="px-[16px] py-[12px] whitespace-nowrap">{formatDate(job.postedOn)}</td>
                    <td className="relative px-[16px] py-[12px]">
                      <button aria-label="Job actions" onClick={() => setMenuFor(openMenu === job.id ? null : job.id)}>
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenu === job.id ? <JobMenu job={job} canSubmit={canSubmitJobForReview(account, verification)} onClose={() => setMenuFor(null)} onConfirm={(action) => setConfirm({ id: job.id, action })} onDuplicate={() => { duplicateJob(job.id); setMenuFor(null); }} /> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
      {filtered.length > 0 ? (
        <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[12px] text-body-sm-regular text-text-secondary">
          <p>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} jobs</p>
          <div className="flex items-center gap-[4px]">
            <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="h-[40px] w-[40px] rounded-full border border-border-default disabled:opacity-40">‹</button>
            {Array.from({ length: Math.min(pages, 5) }).map((_, index) => (
              <button key={index} onClick={() => setPage(index + 1)} className={`h-[40px] w-[40px] rounded-full border ${page === index + 1 ? "border-brand-primary text-brand-primary" : "border-border-default"}`}>{index + 1}</button>
            ))}
            <button disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="h-[40px] w-[40px] rounded-full border border-border-default disabled:opacity-40">›</button>
            <span className="ml-[8px]">{pageSize} per page</span>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm ? confirmTitle(confirm.action) : ""}
        body={confirm ? confirmBody(confirm.action) : ""}
        tone={confirm?.action === "delete" || confirm?.action === "close" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
      <p className="sr-only">{JOB_STATUS_LABEL.active}</p>
      <button className="hidden" onClick={() => router.refresh()} />
    </div>
  );
}

function JobMenu({
  job,
  canSubmit,
  onClose,
  onConfirm,
  onDuplicate,
}: {
  job: Job;
  canSubmit: boolean;
  onClose: () => void;
  onConfirm: (action: "pause" | "resume" | "close" | "delete" | "renew") => void;
  onDuplicate: () => void;
}) {
  const items: { label: string; href?: string; danger?: boolean; onClick?: () => void }[] = [];
  if (job.status === "paused") items.push({ label: "Resume job", onClick: () => onConfirm("resume") });
  if (job.status === "expired") items.push({ label: "Renew job", onClick: () => onConfirm("renew") });
  if (job.status !== "pending_review") items.push({ label: "Edit job", href: `/jobs/${job.id}` });
  if (job.status === "active") items.push({ label: "Close job", onClick: () => onConfirm("close") });
  if (job.status === "active") items.push({ label: "Pause", onClick: () => onConfirm("pause") });
  items.push({ label: "Duplicate job", onClick: onDuplicate });
  if (job.status === "draft" && canSubmit) items.push({ label: "Submit for review", href: `/post-job?state=review&job=${job.id}` });
  items.push({ label: "Delete job", danger: true, onClick: () => onConfirm("delete") });
  return (
    <div className="absolute right-[16px] z-20 w-[176px] rounded-md border border-border-default bg-white py-[4px] text-left shadow-lg">
      {items.map((item) =>
        item.href ? (
          <Link key={item.label} href={item.href} className="block px-[12px] py-[8px] text-body-sm-regular hover:bg-grey-grey-100" onClick={onClose}>
            {item.label}
          </Link>
        ) : (
          <button key={item.label} className={`block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100 ${item.danger ? "text-error-default" : ""}`} onClick={item.onClick}>
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}

function confirmTitle(action: string) {
  if (action === "pause") return "Pause this job?";
  if (action === "resume") return "Resume this job?";
  if (action === "renew") return "Renew this job?";
  if (action === "close") return "Close this job?";
  return "Delete this job?";
}

function confirmBody(action: string) {
  if (action === "pause") return "Candidates will not be able to apply until you resume it.";
  if (action === "resume") return "The job will be visible to job seekers again.";
  if (action === "renew") return "Renewing keeps the listing open for new applicants.";
  if (action === "close") return "The job will no longer be visible. This does not refund a credit.";
  return "This removes the listing from your account in this demo.";
}
