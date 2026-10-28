"use client";

import { Eye, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/feedback";
import { Field, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { Drawer } from "@/components/ui/overlay";
import { usePortal } from "@/components/shell/use-portal";
import { PendingDecision } from "@/components/ui/pending-decision";
import { DOCUMENT_OPTIONS, EMPLOYER, INDUSTRIES } from "@/lib/fixtures";
import { DOCUMENT_ACCEPT_LABEL, DOCUMENT_MAX_BYTES, LOGO_MAX_BYTES } from "@/src/config/policy";
import { VERIFICATION_LABEL } from "@/lib/status";
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
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div>
          <h1 className="text-subheading-semibold">Company Profile</h1>
          <p className="text-body-sm-regular text-text-secondary">Manage your company information. This will be visible to job seekers on your company page.</p>
          <p className="mt-[4px] text-label-medium text-text-secondary">Verification: {VERIFICATION_LABEL[verification]}</p>
        </div>
        <Button variant="outline" onClick={() => setPreview(true)}>
          <Eye size={16} /> Preview profile
        </Button>
      </div>
      {message ? <div className="mt-[16px]"><Banner tone="success" title={message} /></div> : null}
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-body-semibold">Company Logo</h2>
        <div className="mt-[16px] flex flex-wrap items-center gap-[16px]">
          <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-md bg-primary-primary-50 text-body-semibold text-brand-primary">
            {company.logoDataUrl ? (
              // Local file preview; next/image cannot optimize a data URL the user just picked.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              company.logoInitials
            )}
          </div>
          <div>
            <p className="text-body-sm-regular text-text-secondary">
              Square logo works best. Recommended size: 512 × 512 px (JPG, PNG). Size limit <PendingDecision value={LOGO_MAX_BYTES} />.
            </p>
            <div className="mt-[8px] flex gap-[8px]">
              <label className="inline-flex h-[40px] cursor-pointer items-center gap-[8px] rounded-sm border border-border-default px-[12px] text-body-sm-semibold">
                <Upload size={16} /> Change logo
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => onLogo(event.target.files?.[0])} />
              </label>
              <Button variant="danger" size="sm" onClick={() => update("logoDataUrl", null)}>Remove</Button>
            </div>
            {logoError ? <p className="mt-[4px] text-label-regular text-error-default">{logoError}</p> : null}
          </div>
        </div>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-body-semibold">Basic Information</h2>
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
        <h2 className="text-body-semibold">About Company</h2>
        <Field label="Description" required error={errors.description}>
          <TextArea maxLength={500} value={company.description} onChange={(event) => update("description", event.target.value)} />
        </Field>
        <p className="mt-[4px] text-right text-label-regular text-text-tertiary">{company.description.length}/500</p>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-body-semibold">Location & Working Hours</h2>
        <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
          <Field label="Workplace location" required error={errors.workplaceLocation}>
            <TextInput value={company.workplaceLocation} onChange={(event) => update("workplaceLocation", event.target.value)} />
          </Field>
          <Field label="Working hours" required error={errors.workingHours}>
            <TextInput value={company.workingHours} onChange={(event) => update("workingHours", event.target.value)} />
          </Field>
        </div>
      </section>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-body-semibold">Website & Social Links</h2>
        <p className="text-body-sm-regular text-text-secondary">Add your website and social media links. These links will be shown on your company page.</p>
        <div className="mt-[16px] grid gap-[16px] lg:grid-cols-3">
          <Field label="Website"><TextInput value={company.website} onChange={(event) => update("website", event.target.value)} /></Field>
          <Field label="LinkedIn"><TextInput value={company.linkedin} onChange={(event) => update("linkedin", event.target.value)} /></Field>
          <Field label="Instagram"><TextInput value={company.instagram} onChange={(event) => update("instagram", event.target.value)} /></Field>
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
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <h1 className="text-subheading-semibold">{EMPLOYER.companyName}</h1>
      <div className="mt-[16px]"><Banner tone="warning" title="Additional info required" body="Upload the missing company documents. Publishing stays locked." /></div>
      <div className="mt-[16px] grid gap-[16px] lg:grid-cols-[minmax(0,1.4fr)_360px]">
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <h2 className="text-body-semibold">Verification documents</h2>
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
          <h2 className="text-body-semibold">Approval status</h2>
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
