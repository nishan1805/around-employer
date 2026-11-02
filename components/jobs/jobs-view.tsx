"use client";

import { ChevronDown, MoreVertical, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JobBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AnchoredMenu } from "@/components/ui/anchored-menu";
import { EmptyState } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate } from "@/lib/format";
import { actionsForStatus, type JobActionId } from "@/lib/job-actions";
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

type ConfirmAction = "pause" | "resume" | "close" | "delete";

export function JobsView() {
  const router = useRouter();
  const { jobs, state, patchJob, removeJob, duplicateJob } = usePortal();
  const [tab, setTab] = useState<"all" | JobStatus>(state === "returned" ? "returned" : "all");
  const [query, setQuery] = useState("");
  const [clearedEmpty, setClearedEmpty] = useState(false);
  const [location, setLocation] = useState("Location");
  const [category, setCategory] = useState("Job category");
  const [employment, setEmployment] = useState("Employment type");
  const [page, setPage] = useState(1);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: ConfirmAction } | null>(null);
  const pageSize = 10;

  const source = useMemo(() => (state === "empty" ? [] : jobs), [jobs, state]);
  const counts = useMemo(() => {
    const base: Record<string, number> = { all: source.length };
    for (const item of source) base[item.status] = (base[item.status] ?? 0) + 1;
    return base;
  }, [source]);

  const locations = useMemo(() => Array.from(new Set(source.map((job) => job.location))).sort(), [source]);
  const categories = useMemo(() => Array.from(new Set(source.map((job) => job.category))).sort(), [source]);

  const filtered = state === "no-results" && !clearedEmpty ? [] : source.filter((job) => {
    if (tab !== "all" && job.status !== tab) return false;
    if (location !== "Location" && job.location !== location) return false;
    if (category !== "Job category" && job.category !== category) return false;
    if (employment !== "Employment type" && job.employmentType !== employment) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [job.title, job.code, job.location, job.category, job.employmentType].some((value) => value.toLowerCase().includes(needle));
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const openJob = rows.find((job) => job.id === menuFor) ?? source.find((job) => job.id === menuFor) ?? null;
  const lastRowId = rows[rows.length - 1]?.id ?? null;

  useEffect(() => {
    if (state !== "actions" || !lastRowId) return;
    const button = document.querySelector<HTMLButtonElement>(`[data-job-menu="${lastRowId}"]`);
    if (!button) return;
    setMenuFor(lastRowId);
    setMenuAnchor(button);
  }, [state, lastRowId]);

  function runConfirm() {
    if (!confirm) return;
    if (confirm.action === "delete") removeJob(confirm.id);
    if (confirm.action === "pause") patchJob(confirm.id, { status: "paused" });
    if (confirm.action === "resume") patchJob(confirm.id, { status: "active" });
    if (confirm.action === "close") patchJob(confirm.id, { status: "closed" });
    setConfirm(null);
    setMenuFor(null);
  }

  function onAction(job: Job, action: JobActionId) {
    if (action === "edit") {
      router.push(`/post-job?state=details&job=${job.id}`);
      return;
    }
    if (action === "duplicate") {
      duplicateJob(job.id);
      setMenuFor(null);
      return;
    }
    setMenuFor(null);
    setConfirm({ id: job.id, action });
  }

  function clearFilters() {
    setClearedEmpty(true);
    setQuery("");
    setLocation("Location");
    setCategory("Job category");
    setEmployment("Employment type");
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <h1 className="text-display-small-semibold">My Jobs</h1>
          <p className="text-body-sm-regular text-text-secondary">Manage all your job listings, track performance, and take actions.</p>
        </div>
        <Button href="/post-job">Post a Job</Button>
      </div>
      {tab === "returned" && counts.returned ? (
        <p className="mt-[16px] rounded-md bg-warning-warning-50 px-[16px] py-[12px] text-body-sm-regular text-warning-warning-700">
          {counts.returned} jobs were returned for correction. Review the reason on each job, fix it and resubmit.
        </p>
      ) : null}
      <div className="mt-[16px] flex flex-wrap gap-[8px]">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTab(item.id);
              setPage(1);
              setMenuFor(null);
            }}
            className={`inline-flex h-[40px] items-center gap-[8px] rounded-full border px-[12px] text-body-sm-regular ${tab === item.id ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default bg-white text-text-secondary"}`}
          >
            {item.label}
            <span className="rounded-full bg-grey-grey-100 px-[8px] text-label-medium text-text-primary">{counts[item.id] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
        <label className="flex h-[40px] min-w-[240px] flex-1 items-center gap-[8px] rounded-md border border-border-default bg-white px-[12px]">
          <Search size={16} className="text-text-tertiary" />
          <input
            aria-label="Search jobs"
            value={query}
            placeholder="Search by job title, location, or keyword…"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent text-body-sm-regular outline-none placeholder:text-text-tertiary"
          />
        </label>
        <FilterSelect label="Location" value={location} options={["Location", ...locations]} onChange={(value) => { setLocation(value); setPage(1); }} />
        <FilterSelect label="Job category" value={category} options={["Job category", ...categories]} onChange={(value) => { setCategory(value); setPage(1); }} />
        <FilterSelect label="Employment type" value={employment} options={["Employment type", "Full-time", "Part-time", "Contract", "Internship"]} onChange={(value) => { setEmployment(value); setPage(1); }} />
        <FilterSelect label="More filters" value="More filters" options={["More filters"]} onChange={() => undefined} />
      </div>
      <div className="mt-[16px] overflow-hidden rounded-lg border border-border-default bg-white">
        {source.length === 0 ? (
          <EmptyState title="No jobs posted yet" body="Post your first job to start receiving applicants." action={<Button href="/post-job">Post a Job</Button>} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon="search"
            title="No jobs match your search"
            body="Try a different keyword or remove a filter."
            action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <table className="w-full text-left text-body-sm-regular">
            <thead className="bg-background-secondary text-label-medium text-text-secondary">
              <tr>
                {["Job", "Location", "Category", "Employment Type", "Status", "Views", "Applicants", "Posted On", "Actions"].map((label) => (
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
                  <td className="px-[16px] py-[12px]">
                    <button
                      data-job-menu={job.id}
                      aria-label="Job actions"
                      aria-expanded={menuFor === job.id}
                      className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-sm border border-border-default"
                      onClick={(event) => {
                        const next = menuFor === job.id ? null : job.id;
                        setMenuFor(next);
                        setMenuAnchor(next ? event.currentTarget : null);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {openJob ? (
        <AnchoredMenu open={Boolean(menuFor)} anchor={menuAnchor} onClose={() => setMenuFor(null)} className="w-[176px] rounded-md border border-border-default bg-white py-[4px] text-left shadow-lg">
          {actionsForStatus(openJob.status).map((item) => (
            <button
              key={item.id}
              className={`block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100 ${item.danger ? "text-error-default" : ""}`}
              onClick={() => onAction(openJob, item.id)}
            >
              {item.label}
            </button>
          ))}
        </AnchoredMenu>
      ) : null}
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
        confirmLabel={confirm ? confirmLabel(confirm.action) : "Confirm"}
        tone={confirm?.action === "delete" || confirm?.action === "close" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
      <button className="hidden" onClick={() => router.refresh()} />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="relative inline-flex h-[40px] items-center">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-[40px] appearance-none rounded-md border border-border-default bg-white pr-[32px] pl-[12px] text-body-sm-regular">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-[8px] text-text-secondary" />
    </label>
  );
}

function confirmTitle(action: ConfirmAction) {
  if (action === "pause") return "Pause this job?";
  if (action === "resume") return "Resume this job?";
  if (action === "close") return "Close this job?";
  return "Delete this job?";
}

function confirmLabel(action: ConfirmAction) {
  if (action === "pause") return "Pause Job";
  if (action === "resume") return "Resume Job";
  if (action === "close") return "Close Job";
  return "Delete";
}

function confirmBody(action: ConfirmAction) {
  if (action === "pause") return "Candidates will not be able to apply until you resume it.";
  if (action === "resume") return "The job will be visible to job seekers again.";
  if (action === "close") return "The job will no longer be visible. This does not refund a credit.";
  return "This removes the listing from your account in this demo.";
}
