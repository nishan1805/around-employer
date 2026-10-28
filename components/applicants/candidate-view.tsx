"use client";

import { Briefcase, Calendar, Clock, Download, ExternalLink, Globe } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicantBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState, SkeletonBlock } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate } from "@/lib/format";
import type { ApplicantStatus } from "@/lib/types";

const STAGES: ApplicantStatus[] = ["New", "Shortlisted", "Interviewing", "Hired", "Rejected"];

export function CandidateView({ id }: { id: string }) {
  const router = useRouter();
  const { applicants, state, setApplicantStatus, addNote } = usePortal();
  const person = applicants.find((item) => item.id === id) ?? applicants.find((item) => item.id === "amit-sharma");
  const [tab, setTab] = useState<"overview" | "resume">(state === "resume" || state === "no-resume" || state === "unsupported" || state === "resume-error" ? "resume" : "overview");
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState("");

  if (state === "loading") {
    return <div className="space-y-3 px-16 py-6 sm:px-32"><SkeletonBlock className="h-28" /><SkeletonBlock className="h-80" /></div>;
  }
  if (state === "error" || !person) {
    return <ErrorState title="Couldn't load this candidate" body="Check your connection and try again." onRetry={() => router.push(`/applicants/${id}`)} />;
  }
  const candidate = person;
  const detail = candidate.detail;
  const resumeBlocked = state === "no-resume" || state === "unsupported" || state === "resume-error" || !detail?.resume;

  function download() {
    const text = detail?.resume?.pages.map((item) => `${item.heading}\n${item.body}`).join("\n\n") ?? candidate.name;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = detail?.resume?.fileName ?? "resume.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-16 py-6 sm:px-32">
      <Link href="/applicants" className="text-body-sm-medium">‹ Back to Applicants</Link>
      <section className="mt-16 flex flex-wrap items-center gap-16 rounded-lg border border-border-default bg-white p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-primary-50 text-body-semibold text-brand-primary">{candidate.initials}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-display-small-semibold">{candidate.name}</h1>
            <ApplicantBadge status={candidate.status} />
          </div>
          <p className="text-body-sm-regular text-text-secondary">{candidate.phone} · {candidate.location} · {candidate.experience} experience</p>
        </div>
        <div className="relative flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setMenu((open) => !open)}>Change status</Button>
          <Button onClick={download} disabled={resumeBlocked && state !== "overview"}>
            <Download size={16} /> Download resume
          </Button>
          {menu ? (
            <div className="absolute top-48 left-0 z-20 w-44 rounded-md border border-border-default bg-white py-1 shadow-lg">
              {STAGES.map((stage) => (
                <button key={stage} className="block w-full px-3 py-2 text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { setApplicantStatus(candidate.id, stage); setMenu(false); }}>
                  {stage === "Rejected" ? "Not selected" : stage}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      <div className="mt-16 flex gap-6 border-b border-border-default">
        <button onClick={() => setTab("overview")} className={`border-b-2 pb-2 text-body-sm-semibold ${tab === "overview" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-secondary"}`}>Overview</button>
        <button onClick={() => setTab("resume")} className={`border-b-2 pb-2 text-body-sm-semibold ${tab === "resume" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-secondary"}`}>Resume</button>
      </div>
      {tab === "overview" ? (
        <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="space-y-16">
            <Card title="Skills">
              <div className="flex flex-wrap gap-2">
                {(detail?.skills ?? ["Communication", "Sales"]).map((skill) => (
                  <span key={skill} className="rounded-full border border-border-default px-3 py-1 text-label-medium">{skill}</span>
                ))}
              </div>
            </Card>
            <Card title="Work Experience">
              {(detail?.experienceItems ?? []).map((item) => (
                <div key={item.title} className="mb-16 grid gap-2 md:grid-cols-[240px_1fr]">
                  <div>
                    <p className="text-body-sm-semibold">{item.title}</p>
                    <p className="text-body-sm-regular text-text-secondary">{item.org}</p>
                    <p className="mt-1 flex items-center gap-1 text-label-regular text-text-secondary"><Calendar size={14} /> {item.dates}</p>
                  </div>
                  <p className="text-body-sm-regular text-text-secondary">{item.description}</p>
                </div>
              ))}
            </Card>
            {detail ? (
              <Card title="Education">
                <p className="text-body-sm-semibold">{detail.education.degree}</p>
                <p className="text-body-sm-regular text-text-secondary">{detail.education.school}</p>
                <p className="text-label-regular text-text-secondary">{detail.education.dates}</p>
              </Card>
            ) : null}
            <Card title="Additional Information">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info icon={<Briefcase size={16} />} label="Employment type" value={detail?.employmentPreference ?? "Full-time"} />
                <Info icon={<Clock size={16} />} label="Notice period" value={detail?.noticePeriod ?? "30 days"} />
              </div>
            </Card>
            <Card title="Notes">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!note.trim()) return;
                  addNote(candidate.id, note.trim());
                  setNote("");
                }}
                className="flex gap-2"
              >
                <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a private note" className="h-11 flex-1 rounded-sm border border-border-default px-3" />
                <Button type="submit" variant="outline">Add</Button>
              </form>
              <ul className="mt-3 space-y-2">
                {candidate.notes.map((item) => (
                  <li key={item.id} className="text-body-sm-regular"><span className="font-medium">{item.author}</span> · {formatDate(item.at)} — {item.text}</li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="space-y-16">
            <Card title="Application Details">
              <Row label="Job applied for" value={candidate.jobTitle} />
              <Row label="Application date" value={formatDate(candidate.appliedOn)} />
              <Row label="Source" value={detail?.source ?? "Direct Apply"} />
            </Card>
            <Card title="About">
              <p className="text-body-sm-regular text-text-secondary">{detail?.about ?? `${candidate.name} applied for ${candidate.jobTitle}. Open the resume tab for the file.`}</p>
            </Card>
            {detail?.links ? (
              <Card title="Portfolio / Links">
                {detail.links.map((link) => (
                  <a key={link.href} href={link.href} className="mt-2 flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-body-sm-regular text-brand-primary" target="_blank" rel="noreferrer">
                    <Globe size={16} /> <span className="flex-1">{link.label}</span> <ExternalLink size={14} />
                  </a>
                ))}
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <section className="mt-16 rounded-lg border border-border-default bg-white p-5">
          {state === "unsupported" ? (
            <p className="text-body-sm-regular">This file type can’t be previewed. Download it or ask the candidate for a PDF.</p>
          ) : state === "resume-error" ? (
            <ErrorState title="Couldn't load the resume" body="Check your connection and try again." onRetry={() => router.push(`/applicants/${candidate.id}?state=resume`)} />
          ) : state === "no-resume" || !detail?.resume ? (
            <p className="text-body-sm-regular text-text-secondary">No resume was uploaded with this application.</p>
          ) : (
            <div>
              <div className="mb-16 flex items-center justify-between">
                <p className="text-body-sm-semibold">{detail.resume.fileName}</p>
                <p className="text-label-regular text-text-secondary">Page {page + 1} of {detail.resume.pages.length}</p>
              </div>
              <article className="min-h-[360px] rounded-md border border-border-default bg-background-secondary p-6">
                <h2 className="text-subheading-semibold">{detail.resume.pages[page].heading}</h2>
                <p className="mt-3 whitespace-pre-wrap text-body-sm-regular">{detail.resume.pages[page].body}</p>
              </article>
              <div className="mt-16 flex gap-2">
                <Button variant="outline" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button>
                <Button variant="outline" disabled={page === detail.resume.pages.length - 1} onClick={() => setPage((value) => value + 1)}>Next</Button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border-default bg-white p-5">
      <h2 className="mb-3 text-body-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-16 border-b border-border-default py-2 text-body-sm-regular last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-primary-50 text-brand-primary">{icon}</span>
      <div>
        <p className="text-label-regular text-text-secondary">{label}</p>
        <p className="text-body-sm-medium">{value}</p>
      </div>
    </div>
  );
}
