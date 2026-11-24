"use client";

import { AlertCircle, Check, ChevronDown, ChevronLeft, ChevronRight, CircleX, Download, MoreHorizontal, RefreshCw, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicantBadge } from "@/components/ui/badge";
import { downloadFile, downloadResume } from "@/lib/download";
import { AnchoredMenu } from "@/components/ui/anchored-menu";
import { Button } from "@/components/ui/button";
import { EmptyState, SkeletonBlock } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate } from "@/lib/format";
import type { ApplicantStatus } from "@/lib/types";

const TABS: { id: "all" | ApplicantStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "New", label: "New" },
  { id: "Shortlisted", label: "Shortlisted" },
  { id: "Interviewing", label: "Interviewing" },
  { id: "Hired", label: "Hired" },
  { id: "Rejected", label: "Rejected" },
];

export function ApplicantsView({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const { applicants, jobs, state, setApplicantStatus } = usePortal();
  const [tab, setTab] = useState<"all" | ApplicantStatus>("all");
  const [jobFilter, setJobFilter] = useState("All jobs");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [experienceFilter, setExperienceFilter] = useState("Experience");
  const [checked, setChecked] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLButtonElement; statuses: boolean } | null>(null);
  const menuItem = "flex h-[36px] w-full items-center gap-[8px] rounded-[8px] px-[12px] text-left text-body-sm-medium hover:bg-grey-grey-100 disabled:text-text-tertiary";
  const [query, setQuery] = useState("");

  const scoped = useMemo(
    () => (jobId ? applicants.filter((person) => person.jobId === jobId) : applicants),
    [applicants, jobId],
  );
  const counts = { all: scoped.length } as Record<string, number>;
  for (const person of scoped) counts[person.status] = (counts[person.status] ?? 0) + 1;
  const rows = scoped.filter((person) => {
    if (state === "no-results") return false;
    if (tab !== "all" && person.status !== tab) return false;
    if (jobFilter !== "All jobs" && person.jobTitle !== jobFilter) return false;
    if (locationFilter !== "All locations" && person.location !== locationFilter) return false;
    if (experienceFilter !== "Experience" && !person.experience.toLowerCase().includes(experienceFilter.toLowerCase())) return false;
    const needle = query.trim().toLowerCase();
    if (needle && !`${person.name} ${person.phone} ${person.jobTitle} ${person.location}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportSelected() {
    const selected = scoped.filter((person) => checked.includes(person.id));
    const records = [
      ["Applicant", "Phone", "Job", "Status", "Applied On", "Experience", "Location"],
      ...selected.map((person) => [person.name, person.phone, person.jobTitle, person.status, person.appliedOn, person.experience, person.location]),
    ];
    const csv = records.map((record) => record.map((value) => {
      const safe = /^[\s]*[=+@-]|^[\t\r\n]/.test(value) ? "'" + value : value;
      return '"' + safe.replaceAll('"', '""') + '"';
    }).join(",")).join("\r\n");
    downloadFile(csv, "applicants.csv", "text/csv;charset=utf-8");
  }

  if (jobId) return <SplitReview jobTitle={scoped[0]?.jobTitle ?? "Civil Engineer"} people={scoped} onStatus={setApplicantStatus} />;

  const jobOptions = ["All jobs", ...Array.from(new Set(scoped.map((person) => person.jobTitle)))];
  const locationOptions = ["All locations", ...Array.from(new Set(scoped.map((person) => person.location)))];

  return (
    <div>
      <h1 className="text-display-small-semibold">Applicants</h1>
      <p className="text-body-sm-regular text-text-secondary">Manage and track all applicants for your job listings.</p>
      <div className="mt-[16px] flex gap-[4px] overflow-x-auto border-b border-border-default">
        {TABS.map((item) => (
          <button key={item.id} onClick={() => { setTab(item.id); setPage(1); }} aria-pressed={tab === item.id} className={`inline-flex h-[50px] shrink-0 items-center gap-[8px] border-b-2 px-[16px] text-body-sm-semibold ${tab === item.id ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-transparent text-text-secondary"}`}>
            {item.label} <span className={`rounded-full px-[8px] py-[4px] text-label-medium ${tab === item.id ? "bg-background-secondary" : "bg-grey-grey-100"}`}>{counts[item.id] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="mt-[16px] flex flex-wrap gap-[12px]">
        <label className="flex h-[40px] min-w-[240px] flex-1 items-center gap-[8px] rounded-md border border-border-default bg-white px-[12px]">
          <Search size={16} className="text-text-tertiary" />
          <input aria-label="Search applicants" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search applicants" className="w-full bg-transparent text-body-sm-regular outline-none" />
        </label>
        <FilterSelect label="All jobs" value={jobFilter} options={jobOptions} onChange={(value) => { setJobFilter(value); setPage(1); }} />
        <FilterSelect label="All locations" value={locationFilter} options={locationOptions} onChange={(value) => { setLocationFilter(value); setPage(1); }} />
        <FilterSelect label="Experience" value={experienceFilter} options={["Experience", "Fresher", "1 yr", "2 yrs", "3 yrs"]} onChange={(value) => { setExperienceFilter(value); setPage(1); }} />
        <FilterSelect label="More filters" value="More filters" options={["More filters"]} onChange={() => undefined} />
      </div>
      <div className="mt-[16px] overflow-x-auto rounded-lg border border-border-default bg-white">
        <table className="w-full text-left text-body-sm-regular">
          <thead className="bg-grey-grey-50 text-label-medium text-text-secondary">
            <tr>
              <th className="px-[12px] py-[12px]"><input aria-label="Select all applicants" type="checkbox" checked={visible.length > 0 && visible.every((person) => checked.includes(person.id))} onChange={(event) => setChecked(event.target.checked ? Array.from(new Set([...checked, ...visible.map((person) => person.id)])) : checked.filter((id) => !visible.some((person) => person.id === id)))} /></th>
              {["Applicant", "Job", "Status", "Applied On", "Experience", "Location", "Actions"].map((label) => (
                <th key={label} className="px-[12px] py-[12px] font-medium whitespace-nowrap">{label}</th>
              ))}
            </tr>
          </thead>
          {state === "loading" ? (
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-t border-border-default"><td colSpan={8} className="px-[12px] py-[8px]"><SkeletonBlock className="h-[40px]" /></td></tr>
              ))}
            </tbody>
          ) : state === "error" ? (
            <tbody>
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center px-[32px] py-[64px] text-center">
                    <span className="flex size-[56px] items-center justify-center rounded-full bg-grey-grey-100 text-text-secondary"><AlertCircle size={20} /></span>
                    <p className="mt-[16px] text-subheading-semibold">Couldn&apos;t load applicants</p>
                    <p className="mt-[4px] text-body-sm-regular text-text-secondary">Check your connection and try again. Your search and filters are kept.</p>
                    <Button className="mt-[16px]" onClick={() => router.push(jobId ? `/jobs/${jobId}/applicants` : "/applicants")}>Retry</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : visible.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={8}>
                  <EmptyState icon="search" title="No applicants match your search" body="Try a different name, job or filter. Your other applicants are still here." action={<Button variant="outline" onClick={() => { setQuery(""); setJobFilter("All jobs"); setLocationFilter("All locations"); setExperienceFilter("Experience"); setPage(1); }}>Clear filters</Button>} />
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {visible.map((person) => {
                const employment = jobs.find((job) => job.id === person.jobId)?.employmentType ?? "Full-time";
                return (
                  <tr key={person.id} className="border-t border-border-default">
                    <td className="px-[12px] py-[12px]"><input aria-label={`Select ${person.name}`} type="checkbox" checked={checked.includes(person.id)} onChange={(event) => setChecked(event.target.checked ? [...checked, person.id] : checked.filter((id) => id !== person.id))} /></td>
                    <td className="px-[12px] py-[12px]">
                      <Link href={`/applicants/${person.id}`} className="flex items-center gap-[8px] text-text-primary">
                        <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary-primary-50 text-label-medium text-brand-primary">{person.initials}</span>
                        <span>
                          <span className="block whitespace-nowrap font-semibold">{person.name}</span>
                          <span className="block whitespace-nowrap text-label-regular text-text-secondary">{person.phone}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-[12px] py-[12px]">
                      <span className="block whitespace-nowrap">{person.jobTitle}</span>
                      <span className="block whitespace-nowrap text-label-regular text-text-secondary">{employment}</span>
                    </td>
                    <td className="px-[12px] py-[12px] whitespace-nowrap"><ApplicantBadge status={person.status} /></td>
                    <td className="px-[12px] py-[12px] whitespace-nowrap">{formatDate(person.appliedOn)}</td>
                    <td className="px-[12px] py-[12px] whitespace-nowrap">{person.experience}</td>
                    <td className="px-[12px] py-[12px] whitespace-nowrap">{person.location}</td>
                    <td className="relative px-[12px] py-[12px] text-right">
                      <button aria-label={`Actions for ${person.name}`} aria-expanded={menu?.id === person.id} className="inline-flex size-[32px] items-center justify-center text-text-secondary" onClick={(event) => setMenu(menu?.id === person.id ? null : { id: person.id, anchor: event.currentTarget, statuses: false })}><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {checked.length > 0 && (
        <div className="mx-auto mt-[16px] flex min-h-[68px] w-fit max-w-full flex-wrap items-center gap-[16px] rounded-[20px] border border-brand-primary bg-white px-[16px] py-[10px]">
          <span className="flex items-center gap-[8px] text-body-sm-semibold text-brand-primary">
            <span className="grid size-[20px] place-items-center rounded-[4px] bg-brand-primary text-white"><Check size={14} /></span>
            {checked.length} selected
          </span>
          <Button aria-expanded={menu?.id === "bulk"} onClick={(event) => setMenu(menu?.id === "bulk" ? null : { id: "bulk", anchor: event.currentTarget, statuses: true })}>
            Change status <ChevronDown size={16} />
          </Button>
          <Button variant="outline" onClick={exportSelected}><Download size={16} /> Export</Button>
          <button className="flex items-center gap-[4px] text-body-sm-semibold text-brand-primary" onClick={() => { setChecked([]); setMenu(null); }}>Clear <X size={16} className="text-text-secondary" /></button>
        </div>
      )}
      {menu && (
        <AnchoredMenu key={menu.id} open anchor={menu.anchor} onClose={() => setMenu(null)} className="grid w-[200px] gap-[4px] rounded-[16px] border border-border-default bg-white p-[4px] shadow-[0_2px_4px_#0000000f,0_4px_8px_#0000001a]">
          {menu.statuses ? (["Interviewing", "Hired", "Rejected"] as const).map((status) => (
            <button key={status} className={menuItem} onClick={() => {
              const ids = menu.id === "bulk" ? checked : [menu.id];
              ids.forEach((id) => setApplicantStatus(id, status));
              if (menu.id === "bulk") setChecked([]);
              setMenu(null);
              menu.anchor.focus();
            }}>
              {status === "Rejected" ? <CircleX size={16} /> : <Check size={16} />} {status}
            </button>
          )) : (
            <>
              <button className={menuItem} onClick={() => setMenu({ ...menu, statuses: true })}><RefreshCw size={16} /> Change status <ChevronRight size={16} className="ml-auto" /></button>
              <button className={menuItem} disabled={!scoped.find((person) => person.id === menu.id)?.detail?.resume} onClick={() => {
                const resume = scoped.find((person) => person.id === menu.id)?.detail?.resume;
                if (resume) downloadResume(resume);
                setMenu(null);
                menu.anchor.focus();
              }}><Download size={16} /> Download resume</button>
            </>
          )}
        </AnchoredMenu>
      )}
      {state === "loading" || state === "error" || rows.length === 0 ? null : <div className="mt-[16px] flex items-center justify-between text-body-sm-regular text-text-secondary">
        <p>Showing {rows.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, rows.length)} of {rows.length}</p>
        <div className="flex items-center gap-[8px]">
          <button aria-label="Previous page" disabled={currentPage === 1} className="inline-flex size-[40px] items-center justify-center rounded-full border border-border-default disabled:opacity-40" onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button key={number} aria-current={number === currentPage ? "page" : undefined} className={`inline-flex size-[40px] items-center justify-center rounded-full text-body-sm-semibold ${number === currentPage ? "bg-brand-primary text-white" : "border border-border-default"}`} onClick={() => setPage(number)}>{number}</button>
          ))}
          <button aria-label="Next page" disabled={currentPage === pageCount} className="inline-flex size-[40px] items-center justify-center rounded-full border border-border-default disabled:opacity-40" onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>}
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

function SplitReview({
  jobTitle,
  people,
  onStatus,
}: {
  jobTitle: string;
  people: ReturnType<typeof usePortal>["applicants"];
  onStatus: (id: string, status: ApplicantStatus) => void;
}) {
  const [selectedId, setSelectedId] = useState(people[0]?.id ?? "");
  const [note, setNote] = useState("");
  const { addNote } = usePortal();
  const selected = people.find((person) => person.id === selectedId) ?? people[0];
  if (!selected) return <EmptyState title="No applicants yet" body="Applicants will appear here after someone applies." />;
  return (
    <div className="">
      <h1 className="text-display-small-semibold">Applicants</h1>
      <p className="text-body-sm-regular text-text-secondary">{jobTitle} · {people.length} applicants</p>
      <div className="mt-[16px] grid gap-[16px] lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.2fr)]">
        <div className="rounded-lg border border-border-default bg-white p-[12px]">
          {people.slice(0, 8).map((person) => (
            <button key={person.id} onClick={() => setSelectedId(person.id)} className={`flex w-full items-center gap-[12px] rounded-md px-[12px] py-[12px] text-left ${person.id === selected.id ? "bg-primary-primary-50" : ""}`}>
              <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-grey-grey-100 text-label-semibold">{person.initials}</span>
              <span className="min-w-[0px] flex-1">
                <span className="block text-body-sm-semibold">{person.name}</span>
                <span className="block text-label-regular text-text-secondary">{person.experience} · {person.location}</span>
              </span>
              <ApplicantBadge status={person.status} />
            </button>
          ))}
        </div>
        <div className="space-y-[16px] rounded-lg border border-border-default bg-white p-[20px]">
          <div className="flex flex-wrap items-start justify-between gap-[12px]">
            <div>
              <h2 className="text-body-semibold">{selected.name}</h2>
              <p className="text-body-sm-regular text-text-secondary">Applied {formatDate(selected.appliedOn)} · {selected.phone}</p>
            </div>
            <ApplicantBadge status={selected.status} />
          </div>
          <div className="flex flex-wrap gap-[8px]">
            <Button size="sm" onClick={() => onStatus(selected.id, "Shortlisted")}>Shortlist</Button>
            <Button size="sm" variant="outline" onClick={() => onStatus(selected.id, "Interviewing")}>Schedule interview</Button>
            <Button size="sm" variant="outline" onClick={() => onStatus(selected.id, "Rejected")}>Reject</Button>
          </div>
          <div className="flex h-[192px] items-center justify-center rounded-md bg-background-secondary text-body-sm-regular text-text-secondary">Resume PDF preview (placeholder)</div>
          <div>
            <h3 className="text-body-semibold">Notes</h3>
            <form
              className="mt-[8px]"
              onSubmit={(event) => {
                event.preventDefault();
                if (!note.trim()) return;
                addNote(selected.id, note.trim());
                setNote("");
              }}
            >
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Good communication, call on Monday" className="h-[44px] w-full rounded-md border border-border-default px-[12px]" />
            </form>
            <ul className="mt-[12px] space-y-[8px]">
              {selected.notes.map((item) => (
                <li key={item.id} className="rounded-md bg-background-secondary px-[12px] py-[8px] text-body-sm-regular">
                  <span className="font-medium">{item.author}</span> · {formatDate(item.at)}: {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
