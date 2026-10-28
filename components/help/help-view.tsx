"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { EMPLOYER } from "@/lib/fixtures";

const TOPICS = [
  { title: "Posting a job", body: "Save a draft any time. Submit for review only after the company is verified and the account is active." },
  { title: "Verification", body: "The five-step check covers the business, a phone code, a company document, and proof you can hire. Review time is still a placeholder." },
  { title: "Applicants", body: "Open a candidate to change their stage and read the resume." },
  { title: "Billing", body: "Credits and prices are shown as a preview. Purchases are not charged." },
];

export function HelpView() {
  const [sent, setSent] = useState(false);
  return (
    <div className="px-[16px] py-[24px] sm:px-[32px]">
      <h1 className="text-subheading-semibold">Help & Support</h1>
      <p className="text-body-sm-regular text-text-secondary">Answers for the employer portal. Messages stay in this browser.</p>
      <div className="mt-[16px] grid gap-[12px] md:grid-cols-2">
        {TOPICS.map((topic) => (
          <section key={topic.title} className="rounded-lg border border-border-default bg-white p-[20px]">
            <h2 className="text-body-semibold">{topic.title}</h2>
            <p className="mt-[8px] text-body-sm-regular text-text-secondary">{topic.body}</p>
          </section>
        ))}
      </div>
      <form
        className="mt-[16px] max-w-xl space-y-[12px] rounded-lg border border-border-default bg-white p-[20px]"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <h2 className="text-body-semibold">Contact support</h2>
        <Field label="Email"><TextInput type="email" required placeholder={EMPLOYER.email} /></Field>
        <Field label="How can we help?"><TextArea required placeholder="Tell us what you were trying to do" /></Field>
        <Button type="submit">Send message</Button>
        {sent ? <p className="text-body-sm-regular text-success-success-700">Saved locally. TODO: deliver this once a support channel is chosen.</p> : null}
      </form>
    </div>
  );
}
