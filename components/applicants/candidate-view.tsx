"use client";

import { Briefcase, Calendar, ChevronDown, Clock, Download, ExternalLink, Globe } from "lucide-react";
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
  const { applicants, state, setApplicantStatus } = usePortal();
  const person = applicants.find((item) => item.id === id) ?? applicants.find((item) => item.id === "amit-sharma");
  const [tab, setTab] = useState<"overview" | "resume">(state === "resume" || state === "no-resume" || state === "unsupported" || state === "resume-error" ? "resume" : "overview");
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState(false);

  if (state === "loading") {
    return <div className="space-y-[12px] px-[16px] py-[24px] sm:px-[32px]"><SkeletonBlock className="h-[112px]" /><SkeletonBlock className="h-[80px]" /></div>;
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
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <Link href="/applicants" className="text-body-sm-medium">‹ Back to Applicants</Link>
      <section className="mt-[16px] flex flex-wrap items-center gap-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary-primary-50 text-body-semibold text-brand-primary">{candidate.initials}</span>
        <div className="min-w-[0px] flex-1">
          <div className="flex flex-wrap items-center gap-[8px]">
            <h1 className="text-display-small-semibold">{candidate.name}</h1>
            <ApplicantBadge status={candidate.status} />
          </div>
          <p className="text-body-sm-regular text-text-secondary">{candidate.phone} · {candidate.location} · {candidate.experience} experience</p>
        </div>
        <div className="relative flex flex-wrap gap-[8px]">
          <Button aria-expanded={menu} onClick={() => setMenu((open) => !open)}>
            Change status <ChevronDown size={16} />
          </Button>
          <Button variant="outline" onClick={download} disabled={resumeBlocked && state !== "overview"}>
            <Download size={16} /> Download resume
          </Button>
          {menu ? (
            <div className="absolute top-[48px] left-[0px] z-20 w-[176px] rounded-md border border-border-default bg-white py-[4px] shadow-lg">
              {STAGES.map((stage) => (
                <button key={stage} className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { setApplicantStatus(candidate.id, stage); setMenu(false); }}>
                  {stage === "Rejected" ? "Not selected" : stage}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      <div className="mt-[16px] flex border-b border-border-default" role="tablist">
        {(["overview", "resume"] as const).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`border-b-2 px-[16px] py-[12px] text-body-sm-semibold ${tab === item ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-transparent text-text-secondary"}`}
          >
            {item === "overview" ? "Overview" : "Resume"}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="mt-[16px] grid gap-[16px] lg:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="space-y-[16px]">
            {detail?.skills.length ? (
              <Card title="Skills">
                <div className="flex flex-wrap gap-[8px]">
                  {detail.skills.map((skill) => (
                    <span key={skill} className="rounded-sm border border-border-default px-[8px] py-[4px] text-label-medium">{skill}</span>
                  ))}
                </div>
              </Card>
            ) : null}
            {detail?.experienceItems.length ? (
              <Card title="Work Experience">
                <div className="flex flex-col gap-[8px]">
                  {detail.experienceItems.map((item, index) => (
                    <div key={item.title} className="flex items-start gap-[16px]">
                      <div className="flex flex-col items-center self-stretch pt-[4px]">
                        <span className="size-[10px] shrink-0 rounded-full bg-brand-primary" />
                        {index < detail.experienceItems.length - 1 ? <span className="mt-[4px] w-[2px] flex-1 bg-grey-grey-200" /> : null}
                      </div>
                      <div className="grid min-w-[0px] flex-1 gap-[8px] pb-[8px] md:grid-cols-[250px_minmax(0,1fr)]">
                        <div>
                          <p className="text-body-sm-semibold">{item.title}</p>
                          <p className="text-body-sm-regular text-text-secondary">{item.org}</p>
                          <p className="mt-[4px] flex items-center gap-[6px] text-label-regular text-text-secondary"><Calendar size={16} /> {item.dates}</p>
                        </div>
                        <p className="text-body-sm-regular text-text-secondary">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
            {detail?.education.degree || detail?.education.school ? (
              <Card title="Education">
                <p className="text-body-sm-semibold">{detail.education.degree}</p>
                <p className="text-body-sm-regular text-text-secondary">{detail.education.school}</p>
                {detail.education.dates ? <p className="text-label-regular text-text-secondary">{detail.education.dates}</p> : null}
              </Card>
            ) : null}
            {detail?.employmentPreference || detail?.noticePeriod ? (
              <Card title="Additional Information">
                <div className="grid gap-[12px] sm:grid-cols-2">
                  {detail.employmentPreference ? <Info icon={<Briefcase size={16} />} label="Employment type" value={detail.employmentPreference} /> : null}
                  {detail.noticePeriod ? <Info icon={<Clock size={16} />} label="Notice period" value={detail.noticePeriod} /> : null}
                </div>
              </Card>
            ) : null}
          </div>
          <div className="space-y-[16px]">
            <Card title="Application Details">
              <Row label="Job applied for" value={candidate.jobTitle} />
              <Row label="Application date" value={formatDate(candidate.appliedOn)} />
              {detail?.source ? <Row label="Source" value={detail.source} /> : null}
            </Card>
            {detail?.about ? (
              <Card title="About">
                <p className="text-body-sm-regular text-text-secondary">{detail.about}</p>
              </Card>
            ) : null}
            {detail?.links.length ? (
              <Card title="Portfolio / Links">
                {detail.links.map((link) => (
                  <a key={link.href} href={link.href} className="mt-[8px] flex items-center gap-[8px] rounded-md border border-border-default px-[12px] py-[8px] text-body-sm-regular text-brand-primary" target="_blank" rel="noreferrer">
                    <Globe size={16} /> <span className="flex-1">{link.label}</span> <ExternalLink size={14} />
                  </a>
                ))}
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
          {state === "unsupported" ? (
            <p className="text-body-sm-regular">This file type can’t be previewed. Download it or ask the candidate for a PDF.</p>
          ) : state === "resume-error" ? (
            <ErrorState title="Couldn't load the resume" body="Check your connection and try again." onRetry={() => router.push(`/applicants/${candidate.id}?state=resume`)} />
          ) : state === "no-resume" || !detail?.resume ? (
            <p className="text-body-sm-regular text-text-secondary">No resume was uploaded with this application.</p>
          ) : (
            <div>
              <div className="mb-[16px] flex items-center justify-between">
                <p className="text-body-sm-semibold">{detail.resume.fileName}</p>
                <p className="text-label-regular text-text-secondary">Page {page + 1} of {detail.resume.pages.length}</p>
              </div>
              <article className="min-h-[360px] rounded-md border border-border-default bg-background-secondary p-[24px]">
                <h2 className="text-subheading-semibold">{detail.resume.pages[page].heading}</h2>
                <p className="mt-[12px] whitespace-pre-wrap text-body-sm-regular">{detail.resume.pages[page].body}</p>
              </article>
              <div className="mt-[16px] flex gap-[8px]">
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
    <section className="rounded-lg border border-border-default bg-white p-[20px]">
      <h2 className="mb-[12px] text-body-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-[16px] border-b border-border-default py-[8px] text-body-sm-regular last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[12px]">
      <span className="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-primary-primary-50 text-brand-primary">{icon}</span>
      <div>
        <p className="text-label-regular text-text-secondary">{label}</p>
        <p className="text-body-sm-medium">{value}</p>
      </div>
    </div>
  );
}
