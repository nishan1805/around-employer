"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicantBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, SkeletonBlock } from "@/components/ui/feedback";
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
  const { applicants, state, setApplicantStatus } = usePortal();
  const [tab, setTab] = useState<"all" | ApplicantStatus>("all");
  const [query, setQuery] = useState(state === "no-results" ? "UX designer" : "");
  const [role, setRole] = useState(state === "no-results" ? "Product Designer" : "");

  const scoped = useMemo(
    () => (jobId ? applicants.filter((person) => person.jobId === jobId) : applicants),
    [applicants, jobId],
  );
  if (state === "loading") {
    return (
      <div className="space-y-[12px] px-[16px] py-[24px] sm:px-[32px]">
        {Array.from({ length: 6 }).map((_, index) => <SkeletonBlock key={index} className="h-[48px]" />)}
      </div>
    );
  }
  if (state === "error") {
    return <ErrorState title="Couldn't load applicants" body="Check your connection and try again. Your search and filters are kept." onRetry={() => router.push(jobId ? `/jobs/${jobId}/applicants` : "/applicants")} />;
  }

  const counts = { all: scoped.length } as Record<string, number>;
  for (const person of scoped) counts[person.status] = (counts[person.status] ?? 0) + 1;
  const rows = scoped.filter((person) => {
    const tabOk = tab === "all" || person.status === tab;
    const text = `${person.name} ${person.jobTitle} ${person.location}`.toLowerCase();
    const roleOk = !role || person.jobTitle.toLowerCase().includes(role.toLowerCase());
    return tabOk && text.includes(query.toLowerCase()) && roleOk;
  });

  if (jobId) return <SplitReview jobTitle={scoped[0]?.jobTitle ?? "Store Sales Associate"} people={scoped} onStatus={setApplicantStatus} />;

  return (
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <h1 className="text-subheading-semibold">Applicants</h1>
      <p className="text-body-sm-regular text-text-secondary">Manage and track all applicants for your job listings.</p>
      <div className="mt-[16px] flex gap-[16px] overflow-x-auto border-b border-border-default">
        {TABS.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 border-b-2 pb-[8px] text-body-sm-regular ${tab === item.id ? "border-brand-primary font-semibold text-brand-primary" : "border-transparent text-text-secondary"}`}>
            {item.label} <span className="text-label-regular">{counts[item.id] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="mt-[16px] flex flex-wrap gap-[8px]">
        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute top-1/2 left-[12px] -translate-y-1/2 text-text-tertiary" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, skill, or job" className="h-[44px] w-full rounded-md border border-border-default bg-white pr-[12px] pl-[36px]" />
        </label>
        <input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Job" className="h-[44px] rounded-md border border-border-default bg-white px-[12px]" />
      </div>
      <div className="mt-[16px] overflow-hidden rounded-lg border border-border-default bg-white">
        {rows.length === 0 ? (
          <EmptyState icon="search" title="No applicants match your search" body="Try a different name or skill, or clear the filters to see all applicants." action={<Button variant="outline" onClick={() => { setQuery(""); setRole(""); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-body-sm-regular">
              <thead className="bg-background-secondary text-label-medium text-text-secondary">
                <tr>
                  {["Applicant", "Job", "Status", "Applied On", "Experience", "Location", ""].map((label) => (
                    <th key={label} className="px-[16px] py-[12px] font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((person) => (
                  <tr key={person.id} className="border-t border-border-default">
                    <td className="px-[16px] py-[12px] font-semibold">
                      <Link href={`/applicants/${person.id}`} className="text-brand-primary">{person.name}</Link>
                    </td>
                    <td className="px-[16px] py-[12px]">{person.jobTitle}</td>
                    <td className="px-[16px] py-[12px]"><ApplicantBadge status={person.status} /></td>
                    <td className="px-[16px] py-[12px]">{formatDate(person.appliedOn)}</td>
                    <td className="px-[16px] py-[12px]">{person.experience}</td>
                    <td className="px-[16px] py-[12px]">{person.location}</td>
                    <td className="px-[16px] py-[12px]"><Link href={`/applicants/${person.id}`} className="text-body-sm-semibold text-brand-primary">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
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
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <h1 className="text-subheading-semibold">Applicants</h1>
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
