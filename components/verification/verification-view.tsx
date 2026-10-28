"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PendingDecision } from "@/components/ui/pending-decision";
import { EMPLOYER } from "@/lib/fixtures";
import { Field, TextInput } from "@/components/ui/field";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ResumeUpload } from "@/components/ui/resume-upload";
import { usePortal } from "@/components/shell/use-portal";
import {
  DOCUMENT_ACCEPT_LABEL,
  DOCUMENT_MAX_BYTES,
  OTP_DEMO_CODE,
  OTP_EXPIRY_SECONDS,
  OTP_LENGTH,
  OTP_LOCKOUT_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESENDS,
  OTP_RESEND_COOLDOWN_SECONDS,
  SHOW_REFERENCE_ID,
  VERIFICATION_REFERENCE_ID,
  VERIFICATION_SLA_LABEL,
} from "@/src/config/policy";
import { DOCUMENT_OPTIONS } from "@/lib/fixtures";
import type { DocumentKind } from "@/lib/types";

type OtpPhase = "idle" | "partial" | "verifying" | "incorrect" | "expired" | "rate" | "locked" | "network" | "verified";

export function VerificationView() {
  const router = useRouter();
  const { state, setVerificationStatus } = usePortal();
  const initialStep = stepFromState(state);
  const [step, setStep] = useState(initialStep);
  const [companyName, setCompanyName] = useState(EMPLOYER.companyName);
  const [contact, setContact] = useState(EMPLOYER.ownerName);
  const [link, setLink] = useState(state === "v01-manual" ? "" : "maps.app.goo.gl/raipur-builder");
  const [lookup, setLookup] = useState(lookupFromState(state));
  const [address, setAddress] = useState(state === "v01-manual" ? "" : "Shankar Nagar, Raipur, Chhattisgarh");
  const [category, setCategory] = useState(state === "v01-manual" ? "" : "Construction");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState(EMPLOYER.email);
  const [phone, setPhone] = useState("9876543210");
  const [editingPhone, setEditingPhone] = useState(false);
  const [code, setCode] = useState(state === "v02-partial" || state === "v04-partial" ? "482" : "");
  const [otp, setOtp] = useState<OtpPhase>(otpFromState(state));
  const [cooldown, setCooldown] = useState(state.startsWith("v02") || state.startsWith("v04") ? OTP_RESEND_COOLDOWN_SECONDS : 0);
  const [attempts, setAttempts] = useState(0);
  const [resends, setResends] = useState(0);
  const [docType, setDocType] = useState<DocumentKind | "">(state === "v03-other" ? "other" : state.startsWith("v03") && state !== "v03" ? "gst" : "");
  const [docOpen, setDocOpen] = useState(state === "v03-types");
  const [docState, setDocState] = useState(docFromState(state));
  const [docName, setDocName] = useState(state === "v03-uploaded" ? "gst_certificate.pdf" : "");
  const [method, setMethod] = useState<"email" | "id">(state.startsWith("v04-id") ? "id" : "email");
  const [emailVerified, setEmailVerified] = useState(state === "v04-verified");
  const [idFile, setIdFile] = useState(state === "v04-id-uploaded" ? "pan_card.pdf" : "");
  const [idError, setIdError] = useState(state === "v04-id-invalid" ? "Use a PDF, JPG or PNG. The size limit is still a pending decision." : "");
  const [idConsent, setIdConsent] = useState(false);
  const [submitConsent, setSubmitConsent] = useState(false);
  const [submitting, setSubmitting] = useState(state === "v05-submitting");
  const [submitError, setSubmitError] = useState(state === "v05-failed");
  const [lockedEdits, setLockedEdits] = useState(state === "v05-submitting");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const progress = useMemo(() => ["Company", "Mobile", "Company proof", "Representative", "Review"], []);
  const maskedPhone = `+91 ${phone.slice(0, 2) || "98"}XXX XXXXX`;

  function lookupBusiness() {
    setLookup("loading");
    window.setTimeout(() => {
      if (!link.trim()) {
        setLookup("none");
        return;
      }
      if (!link.includes(".")) {
        setLookup("invalid");
        return;
      }
      if (link.toLowerCase().includes("fail")) {
        setLookup("failed");
        return;
      }
      setLookup("found");
      setAddress("Shankar Nagar, Raipur, Chhattisgarh");
      setCategory("Construction");
    }, 700);
  }

  function verifyCode(target: "phone" | "email") {
    if (code.length < OTP_LENGTH || otp === "locked" || otp === "expired") return;
    setOtp("verifying");
    window.setTimeout(() => {
      if (phone.endsWith("0000") || otp === "network") {
        setOtp("network");
        return;
      }
      if (code !== OTP_DEMO_CODE) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= OTP_MAX_ATTEMPTS) setOtp("locked");
        else setOtp("incorrect");
        return;
      }
      setOtp("verified");
      if (target === "email") setEmailVerified(true);
    }, 600);
  }

  function resend() {
    if (cooldown > 0) return;
    if (resends + 1 > OTP_MAX_RESENDS) {
      setOtp("rate");
      return;
    }
    setResends((value) => value + 1);
    setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
    setOtp("idle");
    setCode("");
  }

  function onFile(file: File | undefined, kind: "company" | "id") {
    if (!file) return;
    const okType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!okType || file.size > DOCUMENT_MAX_BYTES) {
      if (kind === "id") setIdError("Use a PDF, JPG or PNG. The size limit is still a pending decision.");
      else setDocState("failed");
      return;
    }
    if (kind === "id") {
      setIdError("");
      setIdFile(file.name);
      return;
    }
    setDocName(file.name);
    setDocState("uploading");
    window.setTimeout(() => setDocState("uploaded"), 700);
  }

  function submit() {
    if (!submitConsent || lockedEdits) return;
    setSubmitting(true);
    setLockedEdits(true);
    window.setTimeout(() => {
      if (companyName.toLowerCase().includes("fail")) {
        setSubmitting(false);
        setLockedEdits(false);
        setSubmitError(true);
        return;
      }
      setVerificationStatus(docType === "other" || method === "id" ? "pending" : "pending");
      setStep(6);
      setSubmitting(false);
    }, 700);
  }

  if (state === "v06" || step === 6) return <Result title="Submitted" heading="Submitted for verification" body={`Your company details have been submitted for verification. We'll notify you when there's an update. Some submissions may need additional review.`} note={state === "v06b" || docType === "other" || method === "id" ? "This one needs a manual review because of the document you chose." : undefined} onClose={() => router.push("/?state=verification-pending")} />;
  if (state === "v10") return <Result title="Resubmitted" heading="Resubmitted for review" body="Your updated details have been resubmitted for review. We'll notify you when there's an update." extra="Your drafts are kept." onClose={() => router.push("/?state=verification-pending")} />;
  if (state === "v11") return <Result title="Verified" heading="Your company is verified" body="You can now submit jobs for review." extra="Each job still goes through job review before it goes live." action="Post a job" onClose={() => router.push("/post-job")} />;
  if (state === "v00") return <Result title="Your progress is saved" heading="You can finish this later" body="Step 3 of 5 · Company proof — not finished. Nothing has been submitted." action="Resume" onClose={() => router.push("/verification?state=v03")} />;

  return (
    <div className="fixed inset-[0px] z-30 flex items-start justify-center overflow-y-auto bg-black/40 p-[16px]">
      <div className="my-[24px] w-full max-w-[560px] rounded-md bg-white p-[24px]">
        <div className="flex items-center gap-[12px]">
          <h1 className="flex-1 text-subheading-semibold">{titleFor(step)}</h1>
          <button aria-label="Close" onClick={() => router.push("/verification?state=v00")}><X size={20} /></button>
        </div>
        <p className="mt-[12px] text-label-medium text-text-secondary">Step {Math.min(step, 5)} of 5 · {progress[Math.min(step, 5) - 1]}</p>
        <div className="mt-[8px]">
          <ProgressBar steps={progress.length} current={step} />
        </div>

        {step === 1 ? (
          <div className="mt-[16px] space-y-[12px]">
            <Field label="Company name" required><TextInput value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></Field>
            <Field label="Contact person name" required><TextInput value={contact} onChange={(event) => setContact(event.target.value)} /></Field>
            <Field label="Google Business Profile link (optional)" hint="We’ll fill in your address and category. You can edit them, or enter them yourself.">
              <TextInput value={link} onChange={(event) => setLink(event.target.value)} onBlur={lookupBusiness} placeholder="maps.app.goo.gl/…" />
            </Field>
            {lookup === "loading" ? <p className="rounded-sm bg-grey-grey-100 px-[12px] py-[12px] text-label-medium">Looking up your business on Google…</p> : null}
            {lookup === "found" ? <p className="rounded-sm bg-success-success-50 px-[12px] py-[12px] text-label-medium text-success-success-700">✓ Found on Google — check and edit if needed</p> : null}
            {lookup === "failed" ? <p className="rounded-sm bg-error-error-50 px-[12px] py-[12px] text-label-regular text-error-default">We couldn’t reach Google. Try the lookup again or enter the details yourself.</p> : null}
            {lookup === "none" ? <p className="rounded-sm bg-warning-warning-50 px-[12px] py-[12px] text-label-regular text-warning-warning-700">No listing found. Enter your address and category manually.</p> : null}
            {lookup === "invalid" ? <p className="rounded-sm bg-error-error-50 px-[12px] py-[12px] text-label-regular text-error-default">That link doesn’t look valid.</p> : null}
            <Field label="Business address" required><TextInput value={address} onChange={(event) => setAddress(event.target.value)} /></Field>
            <Field label="Business category" required><TextInput value={category} onChange={(event) => setCategory(event.target.value)} /></Field>
            <Field label="Website (optional)"><TextInput value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="e.g. raipurbuilder.in" /></Field>
            <Field label="Work email (optional)" hint="A company email speeds up verification"><TextInput value={email} onChange={(event) => setEmail(event.target.value)} placeholder={`e.g. ${EMPLOYER.email}`} /></Field>
            <Button className="w-full" onClick={() => { setStep(2); setCooldown(OTP_RESEND_COOLDOWN_SECONDS); setOtp("idle"); }} disabled={!companyName || !contact || !address || !category}>Continue</Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-[16px] space-y-[12px]">
            <div className="flex items-end gap-[12px]">
              <Field label="Mobile number">
                {editingPhone ? (
                  <TextInput aria-label="Mobile number" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} />
                ) : (
                  <TextInput aria-label="Mobile number" readOnly value={maskedPhone} />
                )}
              </Field>
              <Button variant="outline" className="shrink-0" onClick={() => setEditingPhone(true)}>Change number</Button>
            </div>
            <p className="text-label-medium text-text-secondary">Enter the 6-digit code sent to {maskedPhone}</p>
            <OtpBoxes value={code} onChange={setCode} disabled={otp === "locked" || otp === "verifying"} />
            <OtpMessage phase={otp} cooldown={cooldown} onResend={resend} />
            <div className="grid grid-cols-2 gap-[8px]">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={code.length < OTP_LENGTH || otp === "locked" || otp === "verifying"} onClick={() => { verifyCode("phone"); if (code === OTP_DEMO_CODE) window.setTimeout(() => setStep(3), 700); }}>
                {otp === "verifying" ? "Verifying…" : "Verify"}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-[16px] space-y-[12px]">
            <Field label="Document type" required hint={<>{DOCUMENT_ACCEPT_LABEL}. Size limit <PendingDecision value={DOCUMENT_MAX_BYTES} />.</>}>
              <button type="button" className="flex h-[44px] w-full items-center justify-between rounded-sm border border-border-default px-[12px] text-left" onClick={() => setDocOpen((open) => !open)}>
                {DOCUMENT_OPTIONS.find((item) => item.id === docType)?.label || "Choose a document"}
              </button>
            </Field>
            {docOpen ? (
              <div className="rounded-sm border border-border-default py-[4px]">
                {DOCUMENT_OPTIONS.map((item) => (
                  <button key={item.id} className="block w-full px-[12px] py-[8px] text-left text-body-sm-regular hover:bg-grey-grey-100" onClick={() => { setDocType(item.id); setDocOpen(false); }}>
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            {docType === "other" ? <p className="text-label-regular text-warning-warning-700">Other documents are sent for manual review.</p> : null}
            <ResumeUpload status={docState as "empty" | "uploading" | "uploaded" | "failed" | "cancelled"} fileName={docName} onFile={(file) => onFile(file, "company")} onCancel={() => { setDocState("cancelled"); setDocName(""); }} />
            <div className="grid grid-cols-2 gap-[8px]">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button disabled={docState !== "uploaded" || !docType} onClick={() => setStep(4)}>Continue</Button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-[16px] space-y-[12px]">
            <p className="text-body-sm-regular">Choose one way to show you’re authorised to hire for this business.</p>
            <label className={`block rounded-md border p-[16px] ${method === "email" ? "border-brand-primary" : "border-border-default"}`}>
              <input type="radio" className="mr-[8px]" checked={method === "email"} onChange={() => setMethod("email")} />
              <span className="text-body-sm-semibold">Verify with work email</span>
              <p className="ml-[24px] text-label-regular text-text-secondary">Recommended · we email a 6-digit code to your company address</p>
              {method === "email" ? (
                <div className="mt-[12px] space-y-[8px]">
                  <TextInput value={email} onChange={(event) => setEmail(event.target.value)} />
                  <OtpBoxes value={code} onChange={setCode} />
                  <OtpMessage phase={emailVerified ? "verified" : otp} cooldown={cooldown} onResend={resend} />
                  <Button disabled={emailVerified || code.length < OTP_LENGTH} onClick={() => verifyCode("email")}>{emailVerified ? "Email verified" : "Verify email"}</Button>
                </div>
              ) : null}
            </label>
            <label className={`block rounded-md border p-[16px] ${method === "id" ? "border-brand-primary" : "border-border-default"}`}>
              <input type="radio" className="mr-[8px]" checked={method === "id"} onChange={() => setMethod("id")} />
              <span className="text-body-sm-semibold">Upload PAN or Aadhaar</span>
              <p className="ml-[24px] text-label-regular text-text-secondary">Used only to confirm you represent this business. Not shown to job seekers.</p>
              {method === "id" ? (
                <div className="mt-[12px] space-y-[8px]">
                  <ResumeUpload status={idFile ? "uploaded" : idError ? "failed" : "empty"} fileName={idFile} onFile={(file) => onFile(file, "id")} onCancel={() => setIdFile("")} />
                  {idError ? <p className="text-label-regular text-error-default">{idError}</p> : null}
                  <label className="flex items-start gap-[8px] text-body-sm-regular">
                    <input type="checkbox" checked={idConsent} onChange={(event) => setIdConsent(event.target.checked)} />
                    I consent to Around using this ID only to confirm I represent this business.
                  </label>
                </div>
              ) : null}
            </label>
            <div className="grid grid-cols-2 gap-[8px]">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button disabled={method === "email" ? !emailVerified : !idFile || !idConsent} onClick={() => setStep(5)}>Continue</Button>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-[16px] space-y-[12px]">
            <Summary label="Company" value={companyName} onEdit={() => !lockedEdits && setStep(1)} />
            <Summary label="Contact" value={`${contact} · +91 ${phone.slice(0, 2)}XXX XXXXX ✓`} onEdit={() => !lockedEdits && setStep(2)} />
            <Summary label="Address" value={address} onEdit={() => !lockedEdits && setStep(1)} />
            <Summary label="Company proof" value={`${DOCUMENT_OPTIONS.find((item) => item.id === docType)?.label ?? "Document"} · ${docName}`} onEdit={() => !lockedEdits && setStep(3)} />
            <Summary label="Representative" value={method === "email" ? `Work email · ${email} ✓` : `ID upload · ${idFile}`} onEdit={() => !lockedEdits && setStep(4)} />
            <label className="flex items-start gap-[8px] text-body-sm-regular">
              <input type="checkbox" checked={submitConsent} disabled={lockedEdits} onChange={(event) => setSubmitConsent(event.target.checked)} />
              I confirm these details are true and I’m authorised to hire for this business. I agree to the Employer Terms.
            </label>
            {submitError ? <p className="text-body-sm-regular text-error-default">Couldn’t submit. Check your connection and try again. Your entries are kept.</p> : null}
            <div className="grid grid-cols-2 gap-[8px]">
              <Button variant="outline" disabled={lockedEdits} onClick={() => setStep(4)}>Back</Button>
              <Button disabled={!submitConsent || submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit"}</Button>
            </div>
            <p className="text-label-regular text-text-tertiary">
              Review time <PendingDecision value={VERIFICATION_SLA_LABEL} />. Reference{" "}
              {SHOW_REFERENCE_ID ? `${VERIFICATION_REFERENCE_ID} ` : null}
              <PendingDecision value={VERIFICATION_REFERENCE_ID} show={SHOW_REFERENCE_ID} /> is assigned after a successful submit.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OtpBoxes({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div className="flex gap-[8px]">
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
          key={index}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ""}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = value.split("");
            chars[index] = digit;
            const next = chars.join("").slice(0, OTP_LENGTH);
            onChange(next);
            const sibling = event.target.nextElementSibling as HTMLInputElement | null;
            if (digit && sibling) sibling.focus();
          }}
          className="h-[56px] w-[48px] rounded-sm border border-border-default text-center text-subheading-semibold"
        />
      ))}
    </div>
  );
}

function OtpMessage({ phase, cooldown, onResend }: { phase: OtpPhase; cooldown: number; onResend: () => void }) {
  if (phase === "verifying") return <p className="text-label-regular text-text-secondary">Verifying…</p>;
  if (phase === "incorrect") return <p className="text-label-regular text-error-default">That code is incorrect. Attempts <PendingDecision value={OTP_MAX_ATTEMPTS} />.</p>;
  if (phase === "expired") return <p className="text-label-regular text-error-default">This code has expired. Lifetime <PendingDecision value={OTP_EXPIRY_SECONDS} />. Request a new one.</p>;
  if (phase === "rate") return <p className="text-label-regular text-error-default">Too many resend requests. Try again later. Resend limit <PendingDecision value={OTP_MAX_RESENDS} />.</p>;
  if (phase === "locked") return <p className="text-label-regular text-error-default">Too many attempts. Lockout <PendingDecision value={OTP_LOCKOUT_SECONDS} />.</p>;
  if (phase === "network") return <p className="text-label-regular text-error-default">Couldn’t reach the verification service. Check your connection and try again.</p>;
  if (phase === "verified") return <p className="text-label-medium text-success-success-700">Code verified.</p>;
  return cooldown > 0 ? (
    <p className="text-label-regular text-text-secondary">Resend code in 0:{String(cooldown).padStart(2, "0")}</p>
  ) : (
    <button className="text-label-semibold text-brand-primary" onClick={onResend}>Resend code</button>
  );
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start gap-[12px] text-body-sm-regular">
      <span className="w-[128px] shrink-0 text-text-secondary">{label}</span>
      <span className="flex-1 font-medium">{value}</span>
      <button className="text-brand-primary" onClick={onEdit}>Edit</button>
    </div>
  );
}

function Result({ title, heading, body, note, extra, action = "Go to dashboard", onClose }: { title: string; heading: string; body: string; note?: string; extra?: string; action?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-[0px] z-30 flex items-center justify-center bg-black/40 p-[16px]">
      <div className="w-full max-w-[560px] rounded-md bg-white p-[24px] text-center">
        <div className="mb-[8px] flex justify-end"><button aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <p className="sr-only">{title}</p>
        <CheckCircle2 className="mx-auto text-success-success-700" size={28} />
        <h1 className="mt-[12px] text-subheading-semibold">{heading}</h1>
        <p className="mt-[8px] text-body-sm-regular text-text-secondary">{body}</p>
        {note ? <p className="mt-[12px] rounded-sm bg-warning-warning-50 px-[12px] py-[8px] text-body-sm-regular text-warning-warning-700">{note}</p> : null}
        {extra ? <p className="mt-[12px] text-body-sm-regular">{extra}</p> : null}
        <Button className="mt-[16px] w-full" onClick={onClose}>{action}</Button>
      </div>
    </div>
  );
}

function titleFor(step: number) {
  if (step === 1) return "Tell us about your business";
  if (step === 2) return "Verify your mobile number";
  if (step === 3) return "Upload a company document";
  if (step === 4) return "Verify you represent this business";
  return "Review and submit";
}

function stepFromState(state: string) {
  if (state.startsWith("v02")) return 2;
  if (state.startsWith("v03")) return 3;
  if (state.startsWith("v04")) return 4;
  if (state.startsWith("v05")) return 5;
  if (state === "v06" || state === "v06b") return 6;
  return 1;
}

function lookupFromState(state: string) {
  if (state === "v01-loading") return "loading";
  if (state === "v01-failed") return "failed";
  if (state === "v01-none") return "none";
  if (state === "v01-manual") return "idle";
  if (state === "v01") return "found";
  return "idle";
}

function otpFromState(state: string): OtpPhase {
  if (state.endsWith("verifying")) return "verifying";
  if (state.endsWith("incorrect")) return "incorrect";
  if (state.endsWith("expired")) return "expired";
  if (state.endsWith("rate-limited")) return "rate";
  if (state.endsWith("locked")) return "locked";
  if (state.endsWith("network")) return "network";
  if (state.endsWith("partial")) return "partial";
  if (state === "v04-verified") return "verified";
  return "idle";
}

function docFromState(state: string) {
  if (state === "v03-uploading") return "uploading";
  if (state === "v03-uploaded" || state === "v03-other") return "uploaded";
  if (state === "v03-failed") return "failed";
  if (state === "v03-cancelled") return "cancelled";
  return "empty";
}
