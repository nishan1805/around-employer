"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { StepIndicator } from "@/components/ui/step-indicator";
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
}

const EMPTY: Draft = {
  title: "",
  category: "",
  openings: "1",
  location: "Pandri, Raipur",
  employmentType: "Full-time",
  workArrangement: "On-site",
  experience: "1–3 years",
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
  age: "Any",
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

const STEPS = ["Job details", "Pay & requirements", "Review"];

export function PostJobView() {
  const router = useRouter();
  const { state, account, verification, upsertJob, jobs } = usePortal();
  const [phase, setPhase] = useState(initialPhase(state));
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
      minimumAge: draft.age,
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
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      {phase === "choose" ? (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-display-small-semibold">Post a job</h1>
          <p className="mt-[4px] text-body-sm-regular text-text-secondary">Paste a description and we’ll fill the form, or enter the details yourself. Nothing goes live until you submit it for review.</p>
          <div className="mt-[24px] grid gap-[16px] md:grid-cols-2">
            <button onClick={() => setPhase("paste")} className="rounded-lg border border-border-default bg-white p-[20px] text-left">
              <p className="text-body-semibold">Paste a job description</p>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">We’ll extract the title, pay, work type and requirements. You still review every field.</p>
            </button>
            <button onClick={() => setPhase("details")} className="rounded-lg border border-border-default bg-white p-[20px] text-left">
              <p className="text-body-semibold">Enter details manually</p>
              <p className="mt-[4px] text-body-sm-regular text-text-secondary">Fill the form step by step. You can save a draft at any time.</p>
            </button>
          </div>
        </div>
      ) : null}

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

      {phase === "processing" ? (
        <Processing hold={state === "processing"} onDone={() => { setDraft(AI_DRAFT); setPhase("details"); }} onManual={() => setPhase("details")} failed={false} />
      ) : null}
      {phase === "failed" ? (
        <Processing failed onDone={() => setPhase("paste")} onManual={() => setPhase("details")} />
      ) : null}

      {stepIndex >= 0 ? (
        <div className="grid gap-[16px] lg:grid-cols-[240px_minmax(0,1fr)]">
          <StepIndicator steps={STEPS.map((label) => ({ id: label, label }))} current={stepIndex} />
          <section className="rounded-lg border border-border-default bg-white p-[20px]">
            {phase === "details" ? (
              <div className="space-y-[16px]">
                {state === "details-ai" ? <Banner tone="info" title="Filled from your description" body="Check every field before you continue. Nothing is posted yet." /> : null}
                <div>
                  <h1 className="text-display-small-semibold">Job details</h1>
                  <p className="text-body-sm-regular text-text-secondary">Tell candidates what the role is and where they’ll work.</p>
                </div>
                <div className="grid gap-[16px] md:grid-cols-2">
                  <Field label="Job title" required error={errors.title}><TextInput value={draft.title} onChange={(event) => patch("title", event.target.value)} /></Field>
                  <Field label="Job category" required error={errors.category}>
                    <SelectInput value={draft.category} onChange={(event) => patch("category", event.target.value)}>
                      <option value="">Select</option>
                      {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Number of openings"><TextInput value={draft.openings} onChange={(event) => patch("openings", event.target.value)} /></Field>
                  <Field label="Branch / location" required error={errors.location}><TextInput value={draft.location} onChange={(event) => patch("location", event.target.value)} /></Field>
                  <Field label="Employment type">
                    <SelectInput value={draft.employmentType} onChange={(event) => patch("employmentType", event.target.value as EmploymentType)}>
                      {["Full-time", "Part-time", "Contract", "Internship"].map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Work arrangement">
                    <SelectInput value={draft.workArrangement} onChange={(event) => patch("workArrangement", event.target.value as WorkArrangement)}>
                      {["On-site", "Hybrid", "Remote"].map((item) => <option key={item}>{item}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Experience required"><TextInput value={draft.experience} onChange={(event) => patch("experience", event.target.value)} /></Field>
                  <Field label="Application deadline"><TextInput type="date" value={draft.deadline} onChange={(event) => patch("deadline", event.target.value)} /></Field>
                </div>
                <Field label="Job description" required error={errors.description}><TextArea value={draft.description} onChange={(event) => patch("description", event.target.value)} /></Field>
                <Field label="Skills" hint="Comma separated"><TextInput value={draft.skills} onChange={(event) => patch("skills", event.target.value)} /></Field>
              </div>
            ) : null}
            {phase === "pay" ? (
              <div className="space-y-[16px]">
                <h1 className="text-display-small-semibold">Pay & requirements</h1>
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
                  <Field label="Minimum age" hint="Optional"><TextInput value={draft.age} onChange={(event) => patch("age", event.target.value)} /></Field>
                </div>
              </div>
            ) : null}
            {phase === "review" ? (
              <div className="space-y-[16px]">
                <div>
                  <h1 className="text-display-small-semibold">Review & preview</h1>
                  <p className="text-body-sm-regular text-text-secondary">This is what reviewers will see. Submit only when it looks right.</p>
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
                ]} />
              </div>
            ) : null}
            {saved ? <p className="mt-[12px] text-body-sm-regular text-success-success-700">{saved}</p> : null}
            <div className="mt-[24px] flex flex-wrap justify-between gap-[8px]">
              <Button variant="outline" onClick={() => setPhase(phase === "details" ? "choose" : phase === "pay" ? "details" : "pay")}>Back</Button>
              <div className="flex gap-[8px]">
                <Button variant="outline" onClick={saveDraft}>Save draft</Button>
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
    <div className="max-w-xl">
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
        <h2 className="text-body-semibold">{title}</h2>
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
