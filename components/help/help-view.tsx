"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PendingDecision } from "@/components/ui/pending-decision";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { EMPLOYER } from "@/lib/fixtures";

const TOPICS = [
  { title: "Posting a job", body: "Save a draft any time. Submit for review only after the company is verified and the account is active." },
  { title: "Verification", body: "The five-step check covers the business, a phone code, a company document, and proof you can hire." },
  { title: "Applicants", body: "Open a candidate to change their stage and read the resume." },
  { title: "Billing", body: "Credits and prices are shown as a preview." },
];

export function HelpView() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <h1 className="text-display-small-semibold">Help & Support</h1>
      <p className="text-body-sm-regular text-text-secondary">Answers for the employer portal.</p>
      <div className="mt-[16px] grid gap-[12px] md:grid-cols-2">
        {TOPICS.map((topic) => (
          <section key={topic.title} className="rounded-lg border border-border-default bg-white p-[20px]">
            <h2 className="text-subheading-semibold">{topic.title}</h2>
            <p className="mt-[8px] text-body-sm-regular text-text-secondary">{topic.body}</p>
          </section>
        ))}
      </div>
      <form
        className="mt-[16px] space-y-[12px] rounded-lg border border-border-default bg-white p-[20px]"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <h2 className="text-subheading-semibold">Contact support</h2>
        <Field label="Email"><TextInput type="email" required placeholder={EMPLOYER.email} /></Field>
        <Field label="How can we help?"><TextArea required placeholder="Tell us what you were trying to do" /></Field>
        <Button type="submit">Send message</Button>
        {sent ? <p className="text-body-sm-regular text-text-secondary">Saved on this device. Delivery <PendingDecision value="support channel" />.</p> : null}
      </form>
    </div>
  );
}
