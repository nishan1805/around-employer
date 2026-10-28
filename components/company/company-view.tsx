"use client";

import { Clock, Eye, Link2, MapPin, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/feedback";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { usePortal } from "@/components/shell/use-portal";
import { PendingDecision } from "@/components/ui/pending-decision";
import { DOCUMENT_OPTIONS, EMPLOYER, INDUSTRIES } from "@/lib/fixtures";
import { DOCUMENT_ACCEPT_LABEL, DOCUMENT_MAX_BYTES, LOGO_MAX_BYTES } from "@/src/config/policy";
import type { CompanyProfile } from "@/lib/types";

export function CompanyView() {
  const portal = usePortal();
  const { company, setCompany, saveCompany, resetCompany, savedCompany, state, verification } = portal;
  const [preview, setPreview] = useState(state === "preview");
  const [message, setMessage] = useState(state === "unsaved" ? "You have unsaved changes." : "");
  const [logoError, setLogoError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>(
    state === "errors" ? { name: "Company name is required", description: "Add a short description" } : {},
  );
  const dirty = JSON.stringify(company) !== JSON.stringify(savedCompany) || state === "unsaved";

  function update<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setCompany({ ...company, [key]: value });
    setMessage("");
  }

  function onLogo(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > LOGO_MAX_BYTES) {
      setLogoError("Use a JPG or PNG. The size limit is still a pending decision.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoError("");
      update("logoDataUrl", String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function onSave() {
    const next: Record<string, string> = {};
    if (!company.name.trim()) next.name = "Company name is required";
    if (!company.industry) next.industry = "Choose an industry";
    if (!company.description.trim()) next.description = "Description is required";
    if (!company.workplaceLocation.trim()) next.workplaceLocation = "Workplace location is required";
    if (!company.workingHours.trim()) next.workingHours = "Working hours are required";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveCompany();
    setMessage("Company profile saved. Nothing is published until you press Save.");
  }

  if (state === "documents") return <DocumentsCard />;

  return (
    <div className="">
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <h1 className="text-display-small-semibold">Company Profile</h1>
          <p className="text-body-sm-regular text-text-secondary">Manage your company information. This will be visible to job seekers on your company page.</p>
        </div>
        <Button variant="outline" onClick={() => setPreview(true)}>
          <Eye size={16} /> Preview profile
        </Button>
      </div>
      {message ? <div className="mt-[16px]"><Banner tone="success" title={message} /></div> : null}
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <div className="flex flex-wrap items-center gap-[24px]">
          <div className="w-[200px] shrink-0">
            <h2 className="text-subheading-semibold">Company Logo</h2>
            <p className="text-body-sm-regular text-text-secondary">Upload your company logo.</p>
          </div>
          <div className="flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-primary-50 text-body-semibold text-brand-primary">
            {company.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              company.logoInitials
            )}
          </div>
          <div className="min-w-[220px] flex-[2]">
            <p className="text-body-sm-regular text-text-secondary">
              Square logo works best. Recommended size: 512 × 512 px (JPG, PNG). Size limit <PendingDecision value={LOGO_MAX_BYTES} />
            </p>
            <div className="mt-[8px] flex gap-[8px]">
              <label className="inline-flex h-[40px] cursor-pointer items-center gap-[8px] rounded-sm border border-border-default px-[12px] text-body-sm-semibold">
                <Upload size={16} /> Change logo
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => onLogo(event.target.files?.[0])} />
              </label>
              <Button variant="danger" size="sm" onClick={() => update("logoDataUrl", null)}><Trash2 size={14} /> Remove</Button>
            </div>
            {logoError ? <p className="mt-[4px] text-label-regular text-error-default">{logoError}</p> : null}
          </div>
        </div>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-subheading-semibold">Basic Information</h2>
        <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
          <Field label="Company name" required error={errors.name}>
            <TextInput value={company.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="Industry" required error={errors.industry}>
            <SelectInput value={company.industry} onChange={(event) => update("industry", event.target.value)}>
              {INDUSTRIES.map((item) => <option key={item}>{item}</option>)}
            </SelectInput>
          </Field>
        </div>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-subheading-semibold">About Company</h2>
        <Field label="Description" required error={errors.description}>
          <TextArea maxLength={500} value={company.description} onChange={(event) => update("description", event.target.value)} />
        </Field>
        <p className="mt-[4px] text-right text-label-regular text-text-tertiary">{company.description.length}/500</p>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-subheading-semibold">Location & Working Hours</h2>
        <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
          <Field label="Workplace location" required error={errors.workplaceLocation}>
            <span className="relative block">
              <MapPin size={16} className="absolute top-1/2 left-[12px] -translate-y-1/2 text-text-tertiary" />
              <TextInput className="pl-[40px]" value={company.workplaceLocation} onChange={(event) => update("workplaceLocation", event.target.value)} />
            </span>
          </Field>
          <Field label="Working hours" required error={errors.workingHours}>
            <span className="relative block">
              <Clock size={16} className="absolute top-1/2 left-[12px] -translate-y-1/2 text-text-tertiary" />
              <TextInput className="pl-[40px]" value={company.workingHours} onChange={(event) => update("workingHours", event.target.value)} />
            </span>
          </Field>
        </div>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-subheading-semibold">Website & Social Links</h2>
        <p className="text-body-sm-regular text-text-secondary">Add your website and social media links. These links will be shown on your company page.</p>
        <div className="mt-[16px] grid gap-[16px] lg:grid-cols-3">
          <Field label="Website">
            <span className="relative block"><Link2 size={16} className="absolute top-1/2 left-[12px] -translate-y-1/2 text-text-tertiary" /><TextInput className="pl-[40px]" value={company.website} onChange={(event) => update("website", event.target.value)} /></span>
          </Field>
          <Field label="LinkedIn">
            <span className="relative block"><BrandIcon name="linkedin" /><TextInput className="pl-[40px]" value={company.linkedin} onChange={(event) => update("linkedin", event.target.value)} /></span>
          </Field>
          <Field label="Instagram">
            <span className="relative block"><BrandIcon name="instagram" /><TextInput className="pl-[40px]" value={company.instagram} onChange={(event) => update("instagram", event.target.value)} /></span>
          </Field>
        </div>
      </section>
      <div className="mt-[16px] flex justify-end gap-[8px]">
        <Button variant="outline" onClick={() => { resetCompany(); setMessage("Edits discarded."); }}>Cancel</Button>
        <Button onClick={onSave} disabled={!dirty && state !== "errors"}>Save changes</Button>
      </div>
      {preview ? (
        <Drawer title="Profile preview" onClose={() => setPreview(false)}>
          <p className="text-body-sm-regular text-text-secondary">Job seekers will see this on your company page. This preview uses your unsaved edits and does not save them.</p>
          <div className="mt-[16px] flex items-center gap-[12px]">
            <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-md bg-primary-primary-50 font-semibold text-brand-primary">
              {company.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" src={company.logoDataUrl} className="h-full w-full object-cover" />
              ) : (
                company.logoInitials
              )}
            </div>
            <div>
              <p className="text-subheading-semibold">{company.name || "Company name"}</p>
              <p className="text-body-sm-regular text-text-secondary">{company.industry}</p>
              {verification === "verified" ? <p className="text-label-medium text-success-success-700">Verified</p> : null}
            </div>
          </div>
          <h3 className="mt-[24px] text-body-semibold">About</h3>
          <p className="mt-[8px] text-body-sm-regular">{company.description}</p>
          <p className="mt-[16px] flex items-center gap-[8px] text-body-sm-regular"><MapPin size={16} /> {company.workplaceLocation} · {company.workingHours}</p>
          <ul className="mt-[16px] space-y-[8px] text-body-sm-regular text-brand-primary">
            {company.website ? <li>{company.website}</li> : null}
            {company.linkedin ? <li>{company.linkedin}</li> : null}
            {company.instagram ? <li>{company.instagram}</li> : null}
          </ul>
          <div className="mt-[24px]"><Button variant="outline" onClick={() => setPreview(false)}>Close</Button></div>
        </Drawer>
      ) : null}
    </div>
  );
}

function BrandIcon({ name }: { name: "linkedin" | "instagram" }) {
  const path = name === "linkedin"
    ? "M4.5 2.2A1.7 1.7 0 1 0 4.5 5.6 1.7 1.7 0 0 0 4.5 2.2zM3 6.6h3V14H3V6.6zm4.6 0H10v1c.4-.7 1.3-1.2 2.3-1.2 2 0 2.7 1.2 2.7 3.1V14h-3V10c0-.8 0-1.8-1.2-1.8s-1.3 1-1.3 1.8V14h-3V6.6z"
    : "M8 2.2A5.8 5.8 0 1 0 8 13.8 5.8 5.8 0 0 0 8 2.2zm0 9.6A3.8 3.8 0 1 1 8 4.2a3.8 3.8 0 0 1 0 7.6zM12.2 4.4a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z";
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="absolute top-1/2 left-[12px] size-[16px] -translate-y-1/2 text-text-tertiary" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

function DocumentsCard() {
  const [rows, setRows] = useState(
    DOCUMENT_OPTIONS.map((item, index) => ({
      ...item,
      file: index === 0 ? "gst_certificate.pdf" : "",
      progress: item.id === "shop" ? 60 : 0,
      failed: item.id === "other",
    })),
  );

  function upload(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > DOCUMENT_MAX_BYTES) {
      setRows((items) => items.map((item) => (item.id === id ? { ...item, failed: true, file: file.name } : item)));
      return;
    }
    setRows((items) => items.map((item) => (item.id === id ? { ...item, file: file.name, failed: false, progress: 100 } : item)));
  }

  return (
    <div className="">
      <h1 className="text-subheading-semibold">{EMPLOYER.companyName}</h1>
      <div className="mt-[16px]"><Banner tone="warning" title="Additional info required" body="Upload the missing company documents. Publishing stays locked." /></div>
      <div className="mt-[16px] grid gap-[16px] lg:grid-cols-[minmax(0,1.4fr)_360px]">
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-subheading-semibold">Verification documents</h2>
          <p className="mt-[4px] text-body-sm-regular text-text-secondary">
            {DOCUMENT_ACCEPT_LABEL}. Size limit <PendingDecision value={DOCUMENT_MAX_BYTES} />.
          </p>
          <ul className="mt-[16px] divide-y divide-line">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-[12px] py-[12px]">
                <div className="min-w-[0px] flex-1">
                  <p className="text-body-sm-semibold">{row.label}</p>
                  <p className="text-label-regular text-text-secondary">
                    {row.failed ? `Upload failed · ${row.file || "file"} · connection lost` : row.progress && row.progress < 100 ? `Uploading ${row.file} · ${row.progress}%` : row.file ? `Uploaded · ${row.file}` : "Not uploaded"}
                  </p>
                </div>
                <label className="cursor-pointer text-body-sm-semibold text-brand-primary">
                  {row.failed ? "Retry" : row.file ? "Replace" : "Upload"}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(event) => upload(row.id, event.target.files?.[0])} />
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-subheading-semibold">Approval status</h2>
          <p className="mt-[12px] text-label-regular text-text-secondary">Account</p>
          <p className="text-body-sm-medium">Active · you can sign in and save drafts</p>
          <p className="mt-[12px] text-label-regular text-text-secondary">Company verification</p>
          <p className="text-body-sm-medium">Additional info required</p>
          <p className="mt-[12px] text-label-regular text-text-secondary">Job approval</p>
          <p className="text-body-sm-medium">Checked per job · see My jobs</p>
        </section>
      </div>
    </div>
  );
}
