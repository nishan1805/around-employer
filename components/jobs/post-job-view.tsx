"use client";

import { AlertCircle, Calendar, Check, ChevronLeft, ChevronRight, FileText, Info, List, Minus, Pencil, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";
import { usePortal } from "@/components/shell/use-portal";
import { BENEFITS, CATEGORIES, LOCATIONS } from "@/lib/fixtures";
import { formatInr } from "@/lib/format";
import { canSubmitJobForReview, submitBlockReason } from "@/lib/status";
import { uid } from "@/lib/utils";
import type { EmploymentType, Job, SalaryType, WorkArrangement } from "@/lib/types";

interface Draft {
  title: string;
  category: string;
  openings: string;
  location: string;
  employmentType: EmploymentType | "";
  workArrangement: WorkArrangement | "";
  experience: string;
  deadline: string;
  description: string;
  skills: string;
  salaryType: SalaryType;
  salary: string;
  salaryMax: string;
  benefits: string[];
  education: string;
  startDate: string;
  gender: string;
  age: string;
  ageMax: string;
  extra: string;
}

const EMPTY: Draft = {
  title: "",
  category: "",
  openings: "1",
  location: "",
  employmentType: "",
  workArrangement: "",
  experience: "",
  deadline: "",
  description: "",
  skills: "",
  salaryType: "Fixed salary",
  salary: "",
  salaryMax: "",
  benefits: [],
  education: "Any graduation",
  startDate: "",
  gender: "No preference",
  age: "18",
  ageMax: "35",
  extra: "",
};

const AI_DRAFT: Draft = {
  ...EMPTY,
  title: "Site Supervisor",
  category: "Construction",
  openings: "1",
  location: "Shankar Nagar, Raipur",
  employmentType: "Full-time",
  workArrangement: "On-site",
  description:
    "Raipur Builder is hiring a Site Supervisor in Shankar Nagar, Raipur. The role covers site coordination, drawings and day-to-day construction work.",
  skills: "AutoCAD, Site supervision, Safety",
  experience: "1 year – 3 years",
  salary: "25000",
  age: "18",
  ageMax: "35",
};

/** Figma Post a Job frames: E08a choose, E08b paste, E08c processing, E08e extract failed, E08f AI-filled details, E08g manual details, E08h pay, E08i review, E08j submit confirm. There is no E08d. */

export function PostJobView() {
  const router = useRouter();
  const { state, account, verification, upsertJob, jobs } = usePortal();
  const [phase, setPhase] = useState(initialPhase(state));
  const [method, setMethod] = useState<"ai" | "manual">("ai");
  const [skillDraft, setSkillDraft] = useState("");
  const [paste, setPaste] = useState("Site Supervisor in Shankar Nagar, Raipur. Full-time, on-site. Coordinate site work, drawings and the construction team. Salary ₹25,000.");
  const [draft, setDraft] = useState<Draft>(state === "details-ai" || state === "review" || state === "confirm" || state === "pay" ? AI_DRAFT : EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>(state === "details-invalid" ? { title: "Job title is required", description: "Add a description" } : {});
  const [saved, setSaved] = useState("");
  const [confirm, setConfirm] = useState(state === "confirm");
  const blocked = state === "gate" || !canSubmitJobForReview(account, verification);
  const reason = submitBlockReason(account, verification);

  function patch<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function validateDetails() {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = "Job title is required";
    if (!draft.category) next.category = "Choose a category";
    if (!draft.location.trim()) next.location = "Location is required";
    if (!draft.employmentType) next.employmentType = "Choose an employment type";
    if (!draft.workArrangement) next.workArrangement = "Choose a work arrangement";
    if (!draft.experience.trim()) next.experience = "Choose the experience range";
    if (!draft.description.trim()) next.description = "Add a description";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatePay() {
    const next: Record<string, string> = {};
    if (!draft.salary) next.salary = "Enter a monthly salary";
    if (draft.salaryType === "Salary range" && !draft.salaryMax) next.salaryMax = "Enter the maximum";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function toJob(status: Job["status"]): Job {
    return {
      id: uid("job"),
      code: `AR-${String(jobs.length + 1).padStart(3, "0")}`,
      title: draft.title || "Untitled draft",
      location: draft.location,
      category: draft.category || "Construction",
      employmentType: draft.employmentType || "Full-time",
      workArrangement: draft.workArrangement || "On-site",
      status,
      views: 0,
      applicants: 0,
      postedOn: new Date().toISOString().slice(0, 10),
      submittedOn: status === "pending_review" ? new Date().toISOString().slice(0, 10) : null,
      description: draft.description,
      skills: draft.skills.split(",").map((item) => item.trim()).filter(Boolean),
      openings: Number(draft.openings) || 1,
      experience: draft.experience,
      education: draft.education,
      salaryType: draft.salaryType,
      monthlySalary: Number(draft.salary) || 0,
      salaryMax: draft.salaryMax ? Number(draft.salaryMax) : undefined,
      benefits: draft.benefits,
      genderPreference: draft.gender,
      minimumAge: [draft.age, draft.ageMax].filter(Boolean).join(" – "),
      startDate: draft.startDate,
      deadline: draft.deadline,
    };
  }

  function saveDraft() {
    upsertJob(toJob("draft"));
    setSaved("Draft saved on this device. It is not submitted for review.");
  }

  const stepIndex = phase === "details" ? 0 : phase === "pay" ? 1 : phase === "review" ? 2 : -1;
  const chars = paste.length;

  return (
    <div>
      {/* E08a Choose method */}
      {phase === "choose" ? (
        <div>
          <h1 className="text-display-small-semibold">Post a job</h1>
          <p className="mt-[4px] text-body-regular text-text-secondary">Choose the method that works best for you. You can review and edit all details before publishing.</p>
          <div className="mt-[24px] flex flex-wrap items-start justify-start gap-[16px]">
            <button type="button" onClick={() => setMethod("ai")} className={`w-[312px] rounded-md border p-[24px] text-left ${method === "ai" ? "border-[1.5px] border-brand-primary bg-primary-primary-50" : "border-border-default bg-white"}`}>
              <span className="flex items-start gap-[12px]">
                <span className="flex size-[48px] items-center justify-center rounded-sm bg-white text-brand-primary"><Sparkles size={24} /></span>
                <span className="flex-1" />
                <span className="inline-flex items-center gap-[12px]">
                  <span className="rounded-full bg-white px-[8px] py-[4px] text-label-medium text-brand-primary">Recommended</span>
                  <span className={`flex size-[20px] items-center justify-center rounded-full border ${method === "ai" ? "border-brand-primary bg-brand-primary" : "border-border-strong"}`}>{method === "ai" ? <span className="size-[8px] rounded-full bg-white" /> : null}</span>
                </span>
              </span>
              <p className="mt-[16px] text-subheading-semibold">Create with AI</p>
              <p className="mt-[8px] text-body-sm-regular text-text-secondary">Paste an existing job description from WhatsApp, a poster or an old ad. We&apos;ll extract the key details for you.</p>
            </button>
            <button type="button" onClick={() => setMethod("manual")} className={`w-[312px] rounded-md border p-[24px] text-left ${method === "manual" ? "border-[1.5px] border-brand-primary bg-primary-primary-50" : "border-border-default bg-white"}`}>
              <span className="flex items-start gap-[12px]">
                <span className="flex size-[48px] items-center justify-center rounded-sm bg-warning-warning-50 text-warning-warning-700"><Pencil size={24} /></span>
                <span className="flex-1" />
                <span className={`flex size-[20px] items-center justify-center rounded-full border ${method === "manual" ? "border-brand-primary bg-brand-primary" : "border-border-strong"}`}>{method === "manual" ? <span className="size-[8px] rounded-full bg-white" /> : null}</span>
              </span>
              <p className="mt-[16px] text-subheading-semibold">Create manually</p>
              <p className="mt-[8px] text-body-sm-regular text-text-secondary">Enter the job details yourself using a guided form, step by step.</p>
            </button>
          </div>
          <Button className="mt-[16px]" onClick={() => setPhase(method === "ai" ? "paste" : "details")}>Continue</Button>
          <p className="mt-[16px] flex items-center gap-[8px] text-body-sm-regular text-text-secondary"><FileText size={16} /> You can save as draft anytime.</p>
        </div>
      ) : null}

      {/* E08b Paste description */}
      {phase === "paste" ? (
        <div>
          <h1 className="text-display-small-semibold">Paste a job description</h1>
          <p className="mt-[8px] text-body-regular text-text-secondary">We&apos;ll extract the job title, pay, work type and requirements. Nothing is posted until you review it.</p>
          <section className="mt-[32px] rounded-lg border border-border-default bg-white p-[24px]">
            <div className="flex items-center justify-between text-body-sm-medium">
              <span>Job description <span className="text-error-default">*</span></span>
              <span className="text-label-regular text-text-tertiary">Paste or type your text</span>
            </div>
            <TextArea className="mt-[16px] min-h-[240px]" value={paste} onChange={(event) => setPaste(event.target.value)} />
            <div className="mt-[16px] flex items-center gap-[8px] text-label-regular text-text-secondary">
              <Info size={16} className="shrink-0" />
              <span className="flex-1">We&apos;ll extract the job title, pay, work type and requirements. Nothing is posted until you review it.</span>
              <span>{chars} characters</span>
            </div>
            <div className="mt-[16px] border-t border-border-default pt-[16px]">
              <div className="flex flex-wrap items-center gap-[12px]">
                <p className="flex items-center gap-[8px] text-label-regular text-text-secondary"><FileText size={20} /> Your text is saved as you go.</p>
                <span className="flex-1" />
                <Button variant="outline" onClick={() => setPhase("choose")}>Back</Button>
                <Button disabled={paste.trim().length < 20} onClick={() => setPhase("processing")}>Extract details</Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* E08c Processing */}
      {phase === "processing" ? (
        <Processing hold={state === "processing"} onDone={() => { setDraft(AI_DRAFT); setPhase("details"); }} onManual={() => setPhase("details")} failed={false} />
      ) : null}
      {/* E08e Processing failed */}
      {phase === "failed" ? (
        <Processing failed onDone={() => setPhase("paste")} onManual={() => setPhase("details")} />
      ) : null}

      {stepIndex >= 0 ? (
        <div className="grid items-start gap-[24px] lg:grid-cols-[360px_minmax(0,768px)]">
          <aside className="h-fit rounded-lg border border-border-default bg-white p-[24px]">
            <p className="text-body-semibold">Post a job</p>
            <div className="mt-[12px]"><ProgressBar value={((stepIndex + 1) / 3) * 100} /></div>
            <p className="mt-[4px] text-right text-label-regular text-text-secondary">Step {stepIndex + 1} of 3</p>
            <ol className="mt-[16px]">
              {[
                ["Job Details", "Basic job information and description"],
                ["Pay & Requirements", "Compensation and additional candidate requirements"],
                ["Review & Publish", "Final review and publication"],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-[12px]">
                  <span className="flex flex-col items-center self-stretch">
                    <span className={`flex size-[28px] items-center justify-center rounded-full text-label-medium ${index <= stepIndex ? "bg-brand-primary text-white" : "bg-grey-grey-100 text-text-secondary"}`}>{index + 1}</span>
                    {index < 2 ? <span className="my-[4px] w-px flex-1 bg-border-default" /> : null}
                  </span>
                  <span className={`mb-[8px] min-w-[0px] flex-1 rounded-md px-[8px] py-[4px] ${index === stepIndex ? "bg-primary-primary-50" : ""}`}>
                    <span className={`block text-body-sm-semibold ${index === stepIndex ? "text-brand-primary" : "text-text-primary"}`}>{title}</span>
                    <span className="block text-label-regular text-text-secondary">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </aside>
          <section className="rounded-lg border border-border-default bg-white p-[20px]">
            {/* E08f AI-filled details and E08g manual details */}
            {phase === "details" ? (
              <div className="space-y-[16px]">
                {state === "details-ai" ? <Banner tone="info" title="Filled from your description" body="Check every field before you continue. Nothing is posted yet." /> : null}
                <div>
                  <h1 className="text-display-small-semibold">Job details</h1>
                  <p className="text-body-sm-regular text-text-secondary">Add the basic details of the job you want to post.</p>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <Field label="Job title" required error={errors.title}><TextInput placeholder="e.g. Site Supervisor" value={draft.title} onChange={(event) => patch("title", event.target.value)} /></Field>
                  <Field label="Job category" required error={errors.category}>
                    <SelectInput value={draft.category} onChange={(event) => patch("category", event.target.value)}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Number of openings" required>
                    <span className="flex h-[44px] overflow-hidden rounded-sm border border-border-default">
                      <span className="flex flex-1 items-center px-[12px]">{draft.openings || "1"}</span>
                      <button type="button" aria-label="Decrease openings" className="flex w-[44px] items-center justify-center border-l border-border-default" onClick={() => patch("openings", String(Math.max(1, Number(draft.openings || 1) - 1)))}><Minus size={16} /></button>
                      <button type="button" aria-label="Increase openings" className="flex w-[44px] items-center justify-center border-l border-border-default" onClick={() => patch("openings", String(Number(draft.openings || 1) + 1))}><Plus size={16} /></button>
                    </span>
                  </Field>
                  <Field label="Branch / location" required error={errors.location}>
                    <SelectInput value={draft.location} onChange={(event) => patch("location", event.target.value)}>
                      <option value="">Select a branch</option>
                      {LOCATIONS.map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <div>
                    <p className="mb-[8px] text-label-medium text-text-secondary">Employment type <span className="text-error-default">*</span></p>
                    <div className="grid grid-cols-2 gap-[8px]">
                      {(["Full-time", "Part-time", "Contract", "Internship"] as EmploymentType[]).map((item) => (
                        <button key={item} type="button" onClick={() => patch("employmentType", item)} className={`flex h-[44px] items-center justify-between gap-[8px] rounded-sm border px-[12px] text-body-sm-regular ${draft.employmentType === item ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default"}`}>
                          <span>{item}</span>
                          <span className={`flex size-[16px] shrink-0 items-center justify-center rounded-full border ${draft.employmentType === item ? "border-brand-primary bg-brand-primary" : "border-border-strong"}`}>{draft.employmentType === item ? <span className="size-[6px] rounded-full bg-white" /> : null}</span>
                        </button>
                      ))}
                    </div>
                    {errors.employmentType ? <p className="mt-[4px] text-label-medium text-error-default">{errors.employmentType}</p> : null}
                  </div>
                  <div>
                    <p className="mb-[8px] text-label-medium text-text-secondary">Work arrangement <span className="text-error-default">*</span></p>
                    <div className="grid grid-cols-3 gap-[8px]">
                      {(["On-site", "Remote", "Hybrid"] as WorkArrangement[]).map((item) => (
                        <button key={item} type="button" onClick={() => patch("workArrangement", item)} className={`flex h-[44px] items-center justify-between gap-[8px] rounded-sm border px-[8px] text-body-sm-regular ${draft.workArrangement === item ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default"}`}>
                          <span>{item}</span>
                          <span className={`flex size-[16px] shrink-0 items-center justify-center rounded-full border ${draft.workArrangement === item ? "border-brand-primary bg-brand-primary" : "border-border-strong"}`}>{draft.workArrangement === item ? <span className="size-[6px] rounded-full bg-white" /> : null}</span>
                        </button>
                      ))}
                    </div>
                    {errors.workArrangement ? <p className="mt-[4px] text-label-medium text-error-default">{errors.workArrangement}</p> : null}
                  </div>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <div>
                    <p className="mb-[8px] text-label-medium text-text-secondary">Experience required <span className="text-error-default">*</span></p>
                    <div className="grid grid-cols-2 gap-[8px]">
                      <label className="block">
                        <span className="mb-[4px] block text-label-regular text-text-secondary">Minimum</span>
                        <SelectInput aria-label="Minimum experience" value={draft.experience.split("–")[0]?.trim() ?? ""} onChange={(event) => patch("experience", `${event.target.value} – ${draft.experience.split("–")[1]?.trim() || ""}`.replace(/\s+–\s+$/, ""))}>
                          <option value="">Select</option>
                          {["Fresher", "1 year", "2 years", "3 years"].map((item) => <option key={item}>{item}</option>)}
                        </SelectInput>
                      </label>
                      <label className="block">
                        <span className="mb-[4px] block text-label-regular text-text-secondary">Maximum</span>
                        <SelectInput aria-label="Maximum experience" value={draft.experience.split("–")[1]?.trim() ?? ""} onChange={(event) => patch("experience", `${draft.experience.split("–")[0]?.trim() || ""} – ${event.target.value}`.replace(/^\s+–\s+/, ""))}>
                          <option value="">Select</option>
                          {["3 years", "5 years", "8 years"].map((item) => <option key={item}>{item}</option>)}
                        </SelectInput>
                      </label>
                    </div>
                    {errors.experience ? <p className="mt-[4px] text-label-medium text-error-default">{errors.experience}</p> : null}
                  </div>
                  <div>
                    <p className="mb-[8px] text-label-medium text-text-secondary">Application deadline <span className="text-text-tertiary">(optional)</span></p>
                    <DateField value={draft.deadline} onChange={(value) => patch("deadline", value)} />
                  </div>
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Skills <span className="text-text-tertiary">(optional)</span></p>
                  <TextInput placeholder="Add a skill and press Enter" value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    const next = skillDraft.trim();
                    if (!next) return;
                    const skills = draft.skills.split(",").map((item) => item.trim()).filter(Boolean);
                    if (!skills.includes(next)) patch("skills", [...skills, next].join(", "));
                    setSkillDraft("");
                  }} />
                  <div className="mt-[8px] flex flex-wrap gap-[8px]">
                    {draft.skills.split(",").map((item) => item.trim()).filter(Boolean).map((skill) => (
                      <button key={skill} type="button" className="rounded-full border border-border-default px-[8px] py-[4px] text-label-medium" onClick={() => patch("skills", draft.skills.split(",").map((item) => item.trim()).filter((item) => item && item !== skill).join(", "))}>{skill} ×</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Job description <span className="text-error-default">*</span></p>
                  <div className="overflow-hidden rounded-sm border border-border-default">
                    <p className="border-b border-border-default bg-grey-grey-50 px-[12px] py-[8px] text-label-medium text-text-secondary">Normal text</p>
                    <TextArea className="border-0" placeholder="Describe the role, responsibilities and what you're looking for." value={draft.description} onChange={(event) => patch("description", event.target.value)} />
                  </div>
                  {errors.description ? <p className="mt-[4px] text-label-medium text-error-default">{errors.description}</p> : null}
                </div>
              </div>
            ) : null}
            {/* E08h Pay & requirements */}
            {phase === "pay" ? (
              <div className="space-y-[16px]">
                <h1 className="text-display-small-semibold">Pay & requirements</h1>
                <p className="text-body-sm-regular text-text-secondary">Compensation and additional candidate requirements.</p>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <Field label="Salary type">
                    <div className="grid grid-cols-2 gap-[8px]">
                      {(["Fixed salary", "Salary range"] as SalaryType[]).map((item) => (
                        <button key={item} type="button" onClick={() => patch("salaryType", item)} className={`h-[44px] rounded-sm border text-body-sm-semibold ${draft.salaryType === item ? "border-brand-primary text-brand-primary" : "border-border-default"}`}>{item}</button>
                      ))}
                    </div>
                  </Field>
                  <Field label={draft.salaryType === "Salary range" ? "Minimum monthly salary" : "Monthly salary"} required error={errors.salary}>
                    <TextInput inputMode="numeric" value={salaryText(draft.salary)} onChange={(event) => patch("salary", digitsOnly(event.target.value))} />
                  </Field>
                  {draft.salaryType === "Salary range" ? (
                    <Field label="Maximum monthly salary" error={errors.salaryMax}><TextInput inputMode="numeric" value={salaryText(draft.salaryMax)} onChange={(event) => patch("salaryMax", digitsOnly(event.target.value))} /></Field>
                  ) : null}
                </div>
                <div>
                  <p className="text-label-medium text-text-secondary">Benefits <span className="text-text-tertiary">(optional)</span></p>
                  <div className="mt-[8px] flex flex-wrap gap-[8px]">
                    {BENEFITS.map((benefit) => {
                      const on = draft.benefits.includes(benefit);
                      return (
                        <button key={benefit} type="button" onClick={() => patch("benefits", on ? draft.benefits.filter((item) => item !== benefit) : [...draft.benefits, benefit])} className={`h-[40px] rounded-full border px-[12px] text-body-sm-regular ${on ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default"}`}>
                          {benefit}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <Field label="Education requirement"><TextInput value={draft.education} onChange={(event) => patch("education", event.target.value)} /></Field>
                  <div>
                    <p className="mb-[8px] text-label-medium text-text-secondary">Preferred start date <span className="text-text-tertiary">(optional)</span></p>
                    <DateField value={draft.startDate} onChange={(value) => patch("startDate", value)} />
                  </div>
                  <Field label="Gender preference"><TextInput value={draft.gender} onChange={(event) => patch("gender", event.target.value)} /></Field>
                  <Field label="Minimum age"><TextInput value={draft.age} onChange={(event) => patch("age", event.target.value)} /></Field>
                  <Field label="Maximum age"><TextInput value={draft.ageMax} onChange={(event) => patch("ageMax", event.target.value)} /></Field>
                </div>
                <Field label="Additional requirements" hint={`${draft.extra.length}/500`}>
                  <TextArea maxLength={500} placeholder="Anything else candidates should know." value={draft.extra} onChange={(event) => patch("extra", event.target.value)} />
                </Field>
              </div>
            ) : null}
            {/* E08i Review */}
            {phase === "review" ? (
              <div className="space-y-[16px]">
                <div>
                  <h1 className="text-display-small-semibold">Review & publish</h1>
                  <p className="text-body-sm-regular text-text-secondary">Review the job details before submitting. You can go back and edit if needed.</p>
                </div>
                {blocked ? (
                  <Banner
                    tone="warning"
                    title="Verification gate"
                    body={reason ?? "Submit for review is available only when the company is verified and the account is active."}
                    action={<Button href="/verification" size="sm">Continue verification</Button>}
                  />
                ) : null}
                <ReviewCard title="Job details" onEdit={() => setPhase("details")} rows={[
                  ["Job title", draft.title || "—"],
                  ["Job category", draft.category || "—"],
                  ["Openings", draft.openings],
                  ["Location", draft.location],
                  ["Employment type", draft.employmentType],
                  ["Work arrangement", draft.workArrangement],
                  ["Experience", draft.experience],
                  ["Description", draft.description || "—"],
                  ["Skills", draft.skills || "—"],
                ]} />
                <ReviewCard title="Pay & requirements" onEdit={() => setPhase("pay")} rows={[
                  ["Salary type", draft.salaryType],
                  ["Monthly salary", draft.salary ? formatInr(Number(draft.salary)) : "—"],
                  ["Benefits", draft.benefits.join(", ") || "—"],
                  ["Education", draft.education],
                  ["Gender", draft.gender || "—"],
                  ["Age", [draft.age, draft.ageMax].filter(Boolean).join(" – ") || "—"],
                  ["Additional requirements", draft.extra || "—"],
                ]} />
              </div>
            ) : null}
            {saved ? <p className="mt-[12px] text-body-sm-regular text-success-success-700">{saved}</p> : null}
            <div className="sticky bottom-[0px] mt-[24px] flex flex-wrap justify-end gap-[8px] bg-white py-[12px]">
              <Button variant="outline" onClick={saveDraft}>Save draft</Button>
              <Button variant="outline" onClick={() => setPhase(phase === "details" ? "choose" : phase === "pay" ? "details" : "pay")}>Back</Button>
              <div className="flex gap-[8px]">
                {phase === "details" ? <Button onClick={() => validateDetails() && setPhase("pay")}>Continue</Button> : null}
                {phase === "pay" ? <Button onClick={() => validatePay() && setPhase("review")}>Continue</Button> : null}
                {phase === "review" ? (
                  <Button disabled={blocked} onClick={() => setConfirm(true)}>Submit for review</Button>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* E08j Submit confirm */}
      <ConfirmDialog
        open={confirm}
        title="Submit for review?"
        body={`${draft.title || "This job"} will move to pending review. Editing pauses until the review finishes.`}
        confirmLabel="Submit for review"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          upsertJob(toJob("pending_review"));
          router.push("/jobs");
        }}
      />
    </div>
  );
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function salaryText(digits: string) {
  if (!digits) return "";
  return formatInr(Number(digits));
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function DateField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parsed = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(parsed ?? new Date(2026, 9, 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const label = parsed ? `${parsed.getDate()} ${SHORT_MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}` : "Select date";
  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex h-[44px] w-full items-center gap-[8px] rounded-sm border border-border-default px-[12px] text-left text-body-sm-regular">
        <span className={value ? "flex-1 text-text-primary" : "flex-1 text-text-tertiary"}>{label}</span>
        <Calendar size={16} className="text-text-tertiary" />
      </button>
      {open ? (
        <div className="absolute top-[48px] z-30 w-[280px] rounded-md border border-border-default bg-white p-[12px] shadow-lg">
          <div className="mb-[8px] flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
            <span className="text-body-sm-semibold">{MONTHS[month]} {year}</span>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-label-regular text-text-tertiary">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-[4px] grid grid-cols-7">
            {Array.from({ length: lead }).map((_, index) => <span key={`pad-${index}`} />)}
            {Array.from({ length: count }).map((_, index) => {
              const day = index + 1;
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <button
                  key={day}
                  type="button"
                  className={`mx-auto flex size-[32px] items-center justify-center rounded-full text-body-sm-regular ${iso === value ? "bg-brand-primary text-white" : "hover:bg-grey-grey-100"}`}
                  onClick={() => { onChange(iso); setOpen(false); }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Processing({ failed, hold, onDone, onManual }: { failed: boolean; hold?: boolean; onDone: () => void; onManual: () => void }) {
  const [tick, setTick] = useState(failed ? 0 : 1);
  useEffect(() => {
    if (failed || hold) return;
    if (tick >= 3) {
      const timer = window.setTimeout(onDone, 400);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setTick((value) => value + 1), 700);
    return () => window.clearTimeout(timer);
  }, [failed, hold, onDone, tick]);
  const steps = [
    ["Analysing description", tick > 0],
    ["Identifying key details", tick > 1],
    ["Preparing form", tick > 2],
  ] as const;
  return (
    <div>
      <h1 className="text-display-small-semibold">{failed ? "Post a job" : "Reading your description"}</h1>
      <p className="mt-[8px] text-body-regular text-text-secondary">{failed ? "We couldn’t finish the extract." : "This usually takes a few seconds."}</p>
      {failed ? (
        <section className="mt-[32px] max-w-[640px] rounded-lg border border-border-default bg-white p-[32px]">
          <div className="flex gap-[16px]">
            <span className="flex size-[56px] shrink-0 items-center justify-center rounded-md bg-error-error-50 text-error-default"><AlertCircle size={20} /></span>
            <div>
              <h2 className="text-heading-semibold">We couldn’t extract the job details</h2>
              <p className="mt-[8px] text-body-sm-regular text-text-secondary">The description was too short or we lost the connection. You can try again or type the form yourself.</p>
            </div>
          </div>
          <div className="mt-[24px] rounded-md bg-grey-grey-50 p-[16px]">
            <p className="flex items-center gap-[8px] text-body-sm-semibold"><Info size={16} /> Tips for better results</p>
            <ul className="mt-[8px] space-y-[8px] text-body-sm-regular">
              <li>Include the job title, location, responsibilities and salary.</li>
              <li>Use a clear, structured description.</li>
              <li>Avoid images or scanned documents.</li>
            </ul>
          </div>
          <div className="mt-[24px] flex gap-[12px]">
            <Button onClick={onDone}>Try again</Button>
            <Button variant="outline" onClick={onManual}>Create manually</Button>
          </div>
        </section>
      ) : (
        <>
          <section className="mt-[32px] w-full max-w-[560px] rounded-lg border border-border-default bg-white px-[32px] py-[32px] text-center">
            <span className="mx-auto flex size-[80px] items-center justify-center rounded-full border-4 border-primary-primary-50 text-brand-primary"><Sparkles size={24} /></span>
            <p className="mt-[24px] text-body-semibold">Extracting job details…</p>
            <p className="text-body-sm-regular text-text-secondary">This usually takes a few seconds.</p>
            <ul className="mt-[24px] overflow-hidden rounded-md border border-border-default text-left">
              {steps.map(([label, done], index) => (
                <li key={label} className={`flex items-center gap-[12px] px-[16px] py-[12px] text-body-sm-regular ${index > 0 ? "border-t border-border-default" : ""}`}>
                  <List size={16} className="text-text-secondary" />
                  <span className="flex-1">{label}</span>
                  {done ? <Check size={16} className="text-success-success-700" /> : <span className="size-[16px] rounded-full border border-border-default" />}
                </li>
              ))}
            </ul>
          </section>
          <div className="mt-[32px] flex max-w-[560px] items-center gap-[12px]">
            <Button variant="outline" onClick={onManual}>Back</Button>
            <span className="flex-1" />
            <p className="text-label-regular text-text-secondary">Prefer to type it yourself?</p>
            <button className="text-body-sm-semibold text-brand-primary" onClick={onManual}>Use manual entry</button>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewCard({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <section className="rounded-md border border-border-default">
      <div className="flex items-center justify-between border-b border-border-default px-[16px] py-[12px]">
        <h2 className="text-subheading-semibold">{title}</h2>
        <button className="text-body-sm-semibold text-brand-primary" onClick={onEdit}>Edit</button>
      </div>
      <dl className="grid gap-[8px] p-[16px] sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-label-regular text-text-secondary">{label}</dt>
            <dd className="text-body-sm-regular">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function initialPhase(state: string): "choose" | "paste" | "processing" | "failed" | "details" | "pay" | "review" {
  if (state === "paste") return "paste";
  if (state === "processing") return "processing";
  if (state === "extract-failed") return "failed";
  if (state === "details" || state === "details-ai" || state === "details-invalid") return "details";
  if (state === "pay") return "pay";
  if (state === "review" || state === "confirm" || state === "gate") return "review";
  return "choose";
}
