"use client";

import { AlertCircle, ArrowRight, Briefcase, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, Expand, Globe, Maximize2, Minus, Phone, Plus } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicantBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonBlock } from "@/components/ui/feedback";
import { usePortal } from "@/components/shell/use-portal";
import { formatDate } from "@/lib/format";
import type { Applicant, ApplicantStatus } from "@/lib/types";

const STAGES: ApplicantStatus[] = ["New", "Shortlisted", "Interviewing", "Hired", "Rejected"];

export function CandidateView({ id }: { id: string }) {
  const router = useRouter();
  const { applicants, state, setApplicantStatus } = usePortal();
  const person = applicants.find((item) => item.id === id) ?? applicants.find((item) => item.id === "amit-sharma");
  const [tab, setTab] = useState<"overview" | "resume">(state === "resume" || state === "no-resume" || state === "unsupported" || state === "resume-error" ? "resume" : "overview");
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [menu, setMenu] = useState(false);

  if (state === "loading") {
    return (
      <div className="flex flex-col gap-[20px]">
        <Link href="/applicants" className="inline-flex items-center gap-[8px] text-body-sm-medium text-text-secondary"><ChevronLeft size={16} /> Back to Applicants</Link>
        <section className="flex items-center gap-[20px] rounded-lg border border-border-default bg-white p-[24px]">
          <SkeletonBlock className="size-[56px] shrink-0 !rounded-full" />
          <div className="min-w-[0px] flex-1 space-y-[8px]">
            <SkeletonBlock className="h-[24px] w-[200px] !rounded-[6px]" />
            <SkeletonBlock className="h-[14px] w-[360px] max-w-full !rounded-[6px]" />
          </div>
          <div className="flex shrink-0 gap-[12px]">
            <SkeletonBlock className="h-[40px] w-[150px] !rounded-[8px]" />
            <SkeletonBlock className="h-[40px] w-[170px] !rounded-[8px]" />
          </div>
        </section>
        <div className="flex border-b border-border-default" role="tablist" aria-label="Candidate profile">
          <span className="px-[16px] py-[12px] text-body-sm-semibold text-text-disabled">Overview</span>
          <span className="px-[16px] py-[12px] text-body-sm-semibold text-text-disabled">Resume</span>
        </div>
        <div className="grid items-start gap-[20px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-[20px]">
            <SkeletonCard height="h-[146px]" lines={["title", "full", "full"]} />
            <SkeletonCard height="h-[242px]" lines={["title", "full", "full", "mid", "full", "full", "mid"]} />
            <SkeletonCard height="h-[150px]" lines={["title", "full", "full"]} />
            <SkeletonCard height="h-[122px]" lines={["title", "full", "full"]} />
          </div>
          <div className="flex flex-col gap-[20px]">
            <SkeletonCard height="h-[205px]" lines={["title", "full", "full", "short", "full"]} />
            <SkeletonCard height="h-[222px]" lines={["title", "full", "full", "short", "full", "full"]} />
            <SkeletonCard height="h-[174px]" gap="gap-[12px]" lines={["title", "full", "full", "short"]} />
          </div>
        </div>
      </div>
    );
  }
  if (state === "error" || !person) {
    return (
      <div className="flex min-h-[640px] flex-col">
        <Link href="/applicants" className="inline-flex items-center gap-[8px] text-body-sm-medium text-text-secondary"><ChevronLeft size={16} /> Back to Applicants</Link>
        <div className="flex flex-1 flex-col items-center justify-center px-[24px] text-center">
          <span className="flex size-[56px] items-center justify-center rounded-full bg-grey-grey-100 text-text-secondary"><AlertCircle size={20} /></span>
          <h1 className="mt-[16px] text-subheading-semibold">Couldn&apos;t load profile</h1>
          <p className="mt-[8px] max-w-[420px] text-body-sm-regular text-text-secondary">We couldn&apos;t load this candidate&apos;s profile. Please try again.</p>
          <div className="mt-[16px] flex gap-[12px]">
            <Button variant="outline" href="/applicants">Back to Applicants</Button>
            <Button onClick={() => router.push(`/applicants/${id}`)}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }
  const candidate = person;
  const detail = candidate.detail;
  const resume = detail?.resume ?? null;

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
    <div>
      <Link href="/applicants" className="inline-flex items-center gap-[8px] text-body-sm-medium text-text-primary"><ChevronLeft size={16} /> Back to Applicants</Link>
      <section className="mt-[16px] flex flex-wrap items-center gap-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-grey-grey-100 text-body-semibold text-text-secondary">{candidate.initials}</span>
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
          <Button variant="outline" onClick={download} disabled={state === "no-resume" || !detail?.resume}>
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
        <div className="mt-[16px] grid gap-[16px] lg:grid-cols-[minmax(0,1fr)_360px]">
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
                        <span className="size-[12px] shrink-0 rounded-full bg-brand-primary" />
                        {index < detail.experienceItems.length - 1 ? <span className="mt-[4px] w-[2px] flex-1 bg-grey-grey-200" /> : null}
                      </div>
                      <div className="grid min-w-[0px] flex-1 gap-[8px] pb-[8px] md:grid-cols-[250px_minmax(0,1fr)]">
                        <div>
                          <p className="text-body-sm-semibold">{item.title}</p>
                          <p className="text-body-sm-regular text-text-secondary">{item.org}</p>
                          <p className="mt-[4px] flex items-center gap-[8px] text-label-regular text-text-secondary"><Calendar size={16} /> {item.dates}</p>
                        </div>
                        <p className="max-w-[72ch] text-body-sm-regular text-text-secondary">{item.description}</p>
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
                <p className="max-w-[72ch] text-body-sm-regular text-text-secondary">{detail.about}</p>
              </Card>
            ) : null}
            {detail?.links.length ? (
              <Card title="Portfolio / Links">
                {detail.links.map((link) => (
                  <a key={link.href} href={link.href} className="mt-[8px] flex items-center gap-[8px] rounded-md border border-border-default px-[12px] py-[8px] text-body-sm-regular text-brand-primary" target="_blank" rel="noreferrer">
                    <Globe size={16} /> <span className="flex-1">{link.label}</span> <ArrowRight size={14} />
                  </a>
                ))}
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-body-semibold">Resume</h2>
          <p className="mt-[4px] text-body-sm-regular text-text-secondary">View the candidate&apos;s submitted resume.</p>
          {state === "unsupported" || state === "resume-error" || state === "no-resume" || !resume ? (
            <ResumeNotice
              image={state === "unsupported" ? "/figma/resume-unsupported.svg" : "/figma/resume-empty.svg"}
              title={state === "unsupported" ? "Can’t preview this file" : state === "resume-error" ? "Resume failed to load" : "No resume uploaded"}
              body={state === "unsupported" ? "This file type isn’t supported in the viewer. Download the resume to open it." : state === "resume-error" ? "Something went wrong while loading the resume. Please try again." : `${candidate.name} hasn’t added a resume to this application yet.`}
              action={state === "resume-error" ? <Button className="mt-[16px]" onClick={() => router.push(`/applicants/${candidate.id}?state=resume`)}>Retry</Button> : null}
            />
          ) : (
            <div>
              <div className="mt-[16px] flex overflow-hidden rounded-lg border border-border-default">
                <aside className="flex w-[96px] shrink-0 flex-col gap-[8px] bg-grey-grey-50 p-[12px]">
                  {resume.pages.map((item, index) => (
                    <button key={item.heading} type="button" aria-label={`Page ${index + 1}`} onClick={() => setPage(index)} className={`relative aspect-[3/4] overflow-hidden rounded-sm border bg-white p-[6px] text-left ${page === index ? "border-brand-primary" : "border-border-default"}`}>
                      <span className="block truncate text-[8px] font-semibold leading-[10px]">{item.heading}</span>
                      <span className="mt-[2px] block line-clamp-5 text-[6px] leading-[8px] text-text-secondary">{item.body}</span>
                      <span className={`absolute bottom-[4px] left-1/2 flex h-[16px] min-w-[16px] -translate-x-1/2 items-center justify-center rounded-full px-[4px] text-[10px] ${page === index ? "bg-brand-primary text-white" : "bg-grey-grey-100 text-text-secondary"}`}>{index + 1}</span>
                    </button>
                  ))}
                </aside>
                <div className="min-w-[0px] flex-1">
                  <div className="flex items-center justify-center gap-[12px] bg-grey-grey-900 px-[12px] py-[8px] text-white">
                    <button type="button" aria-label="Previous page" disabled={page === 0} className="disabled:opacity-40" onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={16} /></button>
                    <span className="text-label-medium">{page + 1} / {resume.pages.length}</span>
                    <button type="button" aria-label="Next page" disabled={page === resume.pages.length - 1} className="disabled:opacity-40" onClick={() => setPage((value) => Math.min(resume.pages.length - 1, value + 1))}><ChevronRight size={16} /></button>
                    <span className="h-[16px] w-px bg-grey-grey-700" />
                    <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(50, value - 25))}><Minus size={16} /></button>
                    <span className="min-w-[48px] text-center text-label-medium">{zoom}%</span>
                    <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(200, value + 25))}><Plus size={16} /></button>
                    <span className="h-[16px] w-px bg-grey-grey-700" />
                    <button type="button" aria-label="Fit" onClick={() => setZoom(100)}><Maximize2 size={16} /></button>
                    <button type="button" aria-label="Fullscreen" onClick={() => setZoom((value) => (value === 100 ? 125 : 100))}><Expand size={16} /></button>
                  </div>
                  <div className="flex justify-center overflow-auto bg-grey-grey-700 p-[24px]">
                    <article className="w-[560px] origin-top bg-white p-[32px] text-text-primary shadow-lg" style={{ transform: `scale(${zoom / 100})` }}>
                      <ResumePage candidate={candidate} page={page} />
                    </article>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ResumeNotice({ image, title, body, action }: { image: string; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mt-[16px] flex h-[420px] flex-col items-center justify-center rounded-md border border-dashed border-border-default bg-grey-grey-50 px-[24px] text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" width={192} height={137} />
      <p className="mt-[16px] text-body-semibold">{title}</p>
      <p className="mt-[4px] text-body-sm-regular text-text-secondary">{body}</p>
      {action}
    </div>
  );
}

function SkeletonCard({ height, lines, gap = "gap-[16px]" }: { height: string; lines: Array<"title" | "full" | "mid" | "short">; gap?: string }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-lg border border-border-default bg-white p-[20px] ${height} ${gap}`}>
      {lines.map((line, index) => (
        <SkeletonBlock
          key={index}
          className={
            line === "title" ? "h-[18px] w-[140px] !rounded-[6px]"
            : line === "mid" ? "h-[14px] w-[430px] max-w-full !rounded-[6px]"
            : line === "short" ? "h-[14px] w-[192px] max-w-full !rounded-[6px]"
            : "h-[14px] w-full !rounded-[6px]"
          }
        />
      ))}
    </section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border-default bg-white p-[20px]">
      <h2 className="mb-[16px] text-subheading-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[24px] border-b border-border-default py-[12px] text-body-sm-regular last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ResumePage({ candidate, page }: { candidate: Applicant; page: number }) {
  const detail = candidate.detail;
  if (!detail || page > 0) {
    const sheet = detail?.resume?.pages[page];
    return (
      <div>
        <h2 className="text-display-small-semibold">{sheet?.heading}</h2>
        <p className="mt-[12px] whitespace-pre-wrap text-body-sm-regular text-text-secondary">{sheet?.body}</p>
      </div>
    );
  }
  const firstJob = detail.experienceItems[0];
  return (
    <div className="space-y-[16px]">
      <div>
        <p className="text-display-small-semibold">{candidate.name}</p>
        <p className="text-body-sm-regular text-text-secondary">{candidate.jobTitle}</p>
      </div>
      <div className="flex flex-wrap gap-x-[16px] gap-y-[8px] text-label-regular text-text-secondary">
        <span className="inline-flex items-center gap-[6px]"><Phone size={14} /> {candidate.phone}</span>
        <span className="inline-flex items-center gap-[6px]"><Globe size={14} /> {candidate.email}</span>
        <span>{candidate.location}</span>
        {detail.links[0] ? <a className="inline-flex items-center gap-[6px] text-brand-primary" href={detail.links[0].href}><ArrowRight size={14} /> {detail.links[0].label}</a> : null}
      </div>
      <section className="border-t border-border-default pt-[14px]">
        <p className="text-body-sm-semibold">PROFILE SUMMARY</p>
        <p className="mt-[10px] text-body-sm-regular text-text-secondary">Passionate UI/UX designer with 2+ years of experience in creating user-centered digital products. Skilled in designing responsive web and mobile interfaces, building design systems and collaborating with development teams. Eager to contribute to meaningful products and grow as a designer.</p>
      </section>
      <section className="border-t border-border-default pt-[14px]">
        <p className="text-body-sm-semibold">SKILLS</p>
        <div className="mt-[10px] flex flex-wrap gap-[8px]">
          {detail.skills.map((skill) => <span key={skill} className="rounded-full bg-primary-primary-50 px-[10px] py-[4px] text-label-regular">{skill}</span>)}
        </div>
      </section>
      {firstJob ? (
        <section className="border-t border-border-default pt-[14px]">
          <p className="text-body-sm-semibold">WORK EXPERIENCE</p>
          <div className="mt-[10px] flex gap-[12px]">
            <span className="mt-[6px] size-[8px] shrink-0 rounded-full bg-brand-primary" />
            <div className="min-w-[0px] flex-1">
              <div className="flex items-start justify-between gap-[12px]">
                <p className="text-body-sm-semibold">{firstJob.title}</p>
                <p className="text-label-regular text-text-secondary">{firstJob.dates}</p>
              </div>
              <p className="text-label-regular text-text-secondary">{firstJob.org}</p>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">{firstJob.description}</p>
            </div>
          </div>
        </section>
      ) : null}
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
