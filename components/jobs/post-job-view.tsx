"use client";

import { FileText, Minus, Pencil, Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";
import { usePortal } from "@/components/shell/use-portal";
import { BENEFITS, CATEGORIES } from "@/lib/fixtures";
import { canSubmitJobForReview, submitBlockReason } from "@/lib/status";
import { uid } from "@/lib/utils";
import type { EmploymentType, Job, SalaryType, WorkArrangement } from "@/lib/types";

interface Draft {
  title: string;
  category: string;
  openings: string;
  location: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
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
  employmentType: "Full-time",
  workArrangement: "On-site",
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
  age: "",
  ageMax: "",
  extra: "",
};

const AI_DRAFT: Draft = {
  ...EMPTY,
  title: "Store Sales Associate",
  category: "Retail",
  openings: "1",
  description:
    "We are looking for a Store Sales Associate to join our retail team in Raipur. The ideal candidate will assist customers, maintain displays, and help drive sales.",
  skills: "Communication, Sales, Customer Service, MS Office",
  salary: "25000",
};

/** Figma Post a Job frames: E08a choose, E08b paste, E08c processing, E08e extract failed, E08f AI-filled details, E08g manual details, E08h pay, E08i review, E08j submit confirm. There is no E08d. */

export function PostJobView() {
  const router = useRouter();
  const { state, account, verification, upsertJob, jobs } = usePortal();
  const [phase, setPhase] = useState(initialPhase(state));
  const [method, setMethod] = useState<"ai" | "manual">("ai");
  const [skillDraft, setSkillDraft] = useState("");
  const [paste, setPaste] = useState("Store Sales Associate in Pandri, Raipur. Full-time. Assist customers and maintain displays. Salary ₹25,000.");
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
      category: draft.category || "Retail",
      employmentType: draft.employmentType,
      workArrangement: draft.workArrangement,
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
          <div className="mt-[24px] grid gap-[16px] md:grid-cols-2">
            <button type="button" onClick={() => setMethod("ai")} className={`rounded-lg border p-[20px] text-left ${method === "ai" ? "border-brand-primary bg-primary-primary-50" : "border-border-default bg-white"}`}>
              <span className="flex items-start justify-between">
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-white text-brand-primary"><Sparkles size={18} /></span>
                <span className="inline-flex items-center gap-[8px] text-label-medium text-brand-primary">Recommended <span className={`size-[16px] rounded-full border ${method === "ai" ? "border-brand-primary bg-brand-primary" : "border-border-default"}`} /></span>
              </span>
              <p className="mt-[16px] text-subheading-semibold">Create with AI</p>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">Paste an existing job description from WhatsApp, a poster or an old ad. We&apos;ll extract the key details for you.</p>
            </button>
            <button type="button" onClick={() => setMethod("manual")} className={`rounded-lg border p-[20px] text-left ${method === "manual" ? "border-brand-primary bg-primary-primary-50" : "border-border-default bg-white"}`}>
              <span className="flex items-start justify-between">
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-md bg-warning-warning-50 text-warning-warning-700"><Pencil size={18} /></span>
                <span className={`size-[16px] rounded-full border ${method === "manual" ? "border-brand-primary bg-brand-primary" : "border-border-default"}`} />
              </span>
              <p className="mt-[16px] text-subheading-semibold">Create manually</p>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">Enter the job details yourself using a guided form, step by step.</p>
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
          <p className="text-body-sm-regular text-text-secondary">We’ll extract the details. Nothing is posted until you review it.</p>
          <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
            <div className="flex justify-between text-body-sm-medium">
              <span>Job description *</span>
              <span className="text-label-regular text-text-tertiary">Paste or type your text</span>
            </div>
            <TextArea className="mt-[12px] min-h-[192px]" value={paste} onChange={(event) => setPaste(event.target.value)} />
            <p className="mt-[8px] text-label-regular text-text-secondary">We’ll extract the job title, pay, work type and requirements. {chars} characters. Your text is saved as you go.</p>
            <div className="mt-[16px] flex justify-end gap-[8px]">
              <Button variant="outline" onClick={() => setPhase("choose")}>Back</Button>
              <Button disabled={paste.trim().length < 20} onClick={() => setPhase("processing")}>Extract details</Button>
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
        <div className="grid gap-[16px] lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-lg border border-border-default bg-white p-[16px]">
            <p className="text-body-semibold">Post a job</p>
            <div className="mt-[8px]"><ProgressBar steps={3} current={stepIndex + 1} /></div>
            <p className="mt-[4px] text-right text-label-regular text-text-secondary">Step {stepIndex + 1} of 3</p>
            <ol className="mt-[12px] space-y-[12px]">
              {[
                ["Job Details", "Basic job information and description"],
                ["Pay & Requirements", "Compensation and additional candidate requirements"],
                ["Review & Publish", "Final review and publication"],
              ].map(([title, body], index) => (
                <li key={title} className={`rounded-md px-[12px] py-[8px] ${index === stepIndex ? "bg-primary-primary-50" : ""}`}>
                  <p className={`text-body-sm-semibold ${index === stepIndex ? "text-brand-primary" : "text-text-primary"}`}>{index + 1} {title}</p>
                  <p className="text-label-regular text-text-secondary">{body}</p>
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
                  <Field label="Job title" required error={errors.title}><TextInput placeholder="e.g. Store Sales Associate" value={draft.title} onChange={(event) => patch("title", event.target.value)} /></Field>
                  <Field label="Job category" required error={errors.category}>
                    <SelectInput value={draft.category} onChange={(event) => patch("category", event.target.value)}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Number of openings">
                    <span className="flex h-[44px] items-center justify-between rounded-sm border border-border-default px-[12px]">
                      <button type="button" aria-label="Decrease openings" onClick={() => patch("openings", String(Math.max(1, Number(draft.openings || 1) - 1)))}><Minus size={16} /></button>
                      <span>{draft.openings || "1"}</span>
                      <button type="button" aria-label="Increase openings" onClick={() => patch("openings", String(Number(draft.openings || 1) + 1))}><Plus size={16} /></button>
                    </span>
                  </Field>
                  <Field label="Branch / location" required error={errors.location}>
                    <SelectInput value={draft.location} onChange={(event) => patch("location", event.target.value)}>
                      <option value="">Select a branch</option>
                      {["Shankar Nagar, Raipur", "Pandri, Raipur", "Telibandha, Raipur", "Bhilai", "Durg"].map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Employment type</p>
                  <div className="flex flex-wrap gap-[8px]">
                    {(["Full-time", "Part-time", "Contract", "Internship"] as EmploymentType[]).map((item) => (
                      <button key={item} type="button" onClick={() => patch("employmentType", item)} className={`h-[40px] rounded-sm border px-[12px] text-body-sm-regular ${draft.employmentType === item ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default"}`}>{item}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Work arrangement</p>
                  <div className="flex flex-wrap gap-[8px]">
                    {(["On-site", "Remote", "Hybrid"] as WorkArrangement[]).map((item) => (
                      <button key={item} type="button" onClick={() => patch("workArrangement", item)} className={`h-[40px] rounded-sm border px-[12px] text-body-sm-regular ${draft.workArrangement === item ? "border-brand-primary bg-primary-primary-50 text-brand-primary" : "border-border-default"}`}>{item}</button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <Field label="Experience required">
                    <div className="grid grid-cols-2 gap-[8px]">
                      <SelectInput aria-label="Minimum experience" value={draft.experience.split("–")[0]?.trim() ?? ""} onChange={(event) => patch("experience", `${event.target.value} – ${draft.experience.split("–")[1]?.trim() || "3 years"}`)}>
                        <option value="">Minimum</option>
                        {["Fresher", "1 year", "1 – 3 years"].map((item) => <option key={item}>{item}</option>)}
                      </SelectInput>
                      <SelectInput aria-label="Maximum experience" value={draft.experience.split("–")[1]?.trim() ?? ""} onChange={(event) => patch("experience", `${draft.experience.split("–")[0]?.trim() || "1 year"} – ${event.target.value}`)}>
                        <option value="">Maximum</option>
                        {["3 years", "5 years", "8 years"].map((item) => <option key={item}>{item}</option>)}
                      </SelectInput>
                    </div>
                  </Field>
                  <Field label="Application deadline (optional)">
                    <label className="relative flex h-[44px] items-center rounded-sm border border-border-default px-[12px] text-body-sm-regular">
                      <span className={draft.deadline ? "text-text-primary" : "text-text-tertiary"}>{draft.deadline || "Select date"}</span>
                      <input className="absolute inset-[0px] cursor-pointer opacity-0" type="date" aria-label="Select date" value={draft.deadline} onChange={(event) => patch("deadline", event.target.value)} />
                    </label>
                  </Field>
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Job description <span className="text-error-default">*</span></p>
                  <div className="overflow-hidden rounded-sm border border-border-default">
                    <p className="border-b border-border-default bg-grey-grey-50 px-[12px] py-[8px] text-label-medium text-text-secondary">Normal text</p>
                    <TextArea className="border-0" placeholder="Describe the role, responsibilities and what you're looking for." value={draft.description} onChange={(event) => patch("description", event.target.value)} />
                  </div>
                  {errors.description ? <p className="mt-[4px] text-label-medium text-error-default">{errors.description}</p> : null}
                </div>
                <div>
                  <p className="mb-[8px] text-label-medium text-text-secondary">Skills (optional)</p>
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
                    <TextInput value={draft.salary} onChange={(event) => patch("salary", event.target.value)} />
                  </Field>
                  {draft.salaryType === "Salary range" ? (
                    <Field label="Maximum monthly salary" error={errors.salaryMax}><TextInput value={draft.salaryMax} onChange={(event) => patch("salaryMax", event.target.value)} /></Field>
                  ) : null}
                </div>
                <div>
                  <p className="text-label-medium text-text-secondary">Benefits <span className="text-text-tertiary">Optional</span></p>
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
                  <Field label="Preferred start date"><TextInput type="date" value={draft.startDate} onChange={(event) => patch("startDate", event.target.value)} /></Field>
                  <Field label="Gender preference" hint="Optional"><TextInput value={draft.gender} onChange={(event) => patch("gender", event.target.value)} /></Field>
                  <Field label="Minimum age" hint="Optional"><TextInput placeholder="min 18" value={draft.age} onChange={(event) => patch("age", event.target.value)} /></Field>
                  <Field label="Maximum age" hint="Optional"><TextInput placeholder="max 35" value={draft.ageMax} onChange={(event) => patch("ageMax", event.target.value)} /></Field>
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
                  ["Monthly salary", draft.salary ? `₹${draft.salary}` : "—"],
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
  return (
    <div className="w-full">
      <h1 className="text-display-small-semibold">{failed ? "Post a job" : "Reading your description"}</h1>
      <p className="text-body-sm-regular text-text-secondary">{failed ? "We couldn’t finish the extract." : "This usually takes a few seconds."}</p>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[24px]">
        {failed ? (
          <>
            <h2 className="text-subheading-semibold">We couldn’t extract the job details</h2>
            <p className="mt-[8px] text-body-sm-regular text-text-secondary">The description was too short or we lost the connection. You can try again or type the form yourself.</p>
            <ul className="mt-[16px] space-y-[4px] text-body-sm-regular">
              <li>Include the job title, location, responsibilities and salary.</li>
              <li>Use a clear, structured description.</li>
              <li>Avoid images or scanned documents.</li>
            </ul>
            <div className="mt-[16px] flex gap-[8px]">
              <Button onClick={onDone}>Try again</Button>
              <Button variant="outline" onClick={onManual}>Create manually</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-body-semibold">Extracting job details…</p>
            <ul className="mt-[16px] space-y-[8px] text-body-sm-regular">
              <li>Analysing description {tick > 0 ? "· done" : ""}</li>
              <li>Identifying key details {tick > 1 ? "· done" : "· in progress"}</li>
              <li>Preparing form {tick > 2 ? "· done" : ""}</li>
            </ul>
            <button className="mt-[16px] text-body-sm-semibold text-brand-primary" onClick={onManual}>Prefer to type it yourself? Use manual entry</button>
          </>
        )}
      </section>
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
