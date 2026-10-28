"use client";

import { Button } from "@/components/ui/button";
import { PendingDecision } from "@/components/ui/pending-decision";
import { EMPLOYER } from "@/lib/fixtures";
import { CREDIT_PACKS, FREE_JOB_ALLOWANCE, PLAN_JOB_POST_LIMIT } from "@/src/config/policy";

const HISTORY = [
  { date: "12 Oct 2026", description: "Renewed · Store Sales Associate", credits: "−1", balance: "4", positive: false },
  { date: "5 Oct 2026", description: "Bought 5-credit pack", credits: "+5", balance: "5", positive: true },
  { date: "1 Oct 2026", description: "Posted · Patient Care Assistant (free allowance)", credits: "0", balance: "0", positive: false },
];

export function BillingView() {
  return (
    <div>
      <p className="text-body-sm-regular text-text-secondary">{EMPLOYER.companyName}</p>
      <div className="mt-[16px] grid gap-[16px] md:grid-cols-2">
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <p className="text-label-medium text-text-secondary">Credit balance</p>
          <p className="mt-[8px] text-heading-semibold">4 job credits</p>
          <p className="mt-[8px] text-label-regular text-text-secondary">1 credit = 1 job live for 30 days</p>
        </section>
        <section className="rounded-lg border border-border-default bg-white p-[20px]">
          <p className="text-label-medium text-text-secondary">Free allowance</p>
          <p className="mt-[8px] text-heading-semibold">
            <PendingDecision value={FREE_JOB_ALLOWANCE} />
          </p>
          <p className="mt-[8px] text-label-regular text-text-secondary">
            Included live posts <PendingDecision value={PLAN_JOB_POST_LIMIT} />
          </p>
          <p className="mt-[8px] text-label-regular text-text-secondary">Resets on 1 Nov</p>
        </section>
      </div>
      <section className="mt-[16px] rounded-lg border border-border-default bg-white p-[20px]">
        <h2 className="text-subheading-semibold">How credits work</h2>
        <p className="mt-[8px] text-body-sm-regular text-text-secondary">
          Each month you can keep a set number of jobs live for free. Beyond that, posting or renewing a job uses 1 credit. Pausing doesn’t refund credits; closing early doesn’t either. Prices shown may change
        </p>
      </section>
      <div className="mt-[16px] grid gap-[16px] lg:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <section key={pack.credits} className="rounded-lg border border-border-default bg-white p-[20px]">
            <h2 className="text-subheading-semibold">{pack.credits} credits</h2>
            <p className="mt-[8px] text-heading-semibold">{pack.priceLabel}</p>
            <p className="mt-[8px] text-body-sm-regular text-text-secondary">{pack.blurb}</p>
            <Button className="mt-[16px] w-full" variant="outline" onClick={() => undefined}>Buy credits</Button>
          </section>
        ))}
      </div>
      <section className="mt-[16px] overflow-hidden rounded-lg border border-border-default bg-white">
        <table className="w-full text-left text-body-sm-regular">
          <thead className="bg-grey-grey-50 text-label-medium text-text-secondary">
            <tr>
              {["Date", "Description", "Credits", "Balance"].map((label) => <th key={label} className="px-[16px] py-[12px] font-medium">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row) => (
              <tr key={row.description} className="border-t border-border-default">
                <td className="px-[16px] py-[12px] whitespace-nowrap">{row.date}</td>
                <td className="px-[16px] py-[12px]">{row.description}</td>
                <td className={`px-[16px] py-[12px] whitespace-nowrap ${row.positive ? "text-success-success-700" : ""}`}>{row.credits}</td>
                <td className="px-[16px] py-[12px] whitespace-nowrap">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
