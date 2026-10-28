"use client";

import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, FREE_JOB_ALLOWANCE } from "@/src/config/policy";

const HISTORY = [
  { date: "12 Oct 2026", description: "Renewed · Store Sales Associate", credits: "−1", balance: "4" },
  { date: "5 Oct 2026", description: "Bought 5-credit pack", credits: "+5", balance: "5" },
  { date: "1 Oct 2026", description: "Posted · Patient Care Assistant (free allowance)", credits: "0", balance: "0" },
];

export function BillingView() {
  return (
    <div className="px-16 py-6 sm:px-32">
      <h1 className="text-subheading-semibold">Billing & job credits</h1>
      <p className="text-body-sm-regular text-text-secondary">Shree Ganesh Retail Mart</p>
      <div className="mt-16 grid gap-16 md:grid-cols-2">
        <section className="rounded-lg border border-border-default bg-white p-5">
          <p className="text-label-medium text-text-secondary">Credit balance</p>
          <p className="mt-2 text-display-small-semibold">4 job credits</p>
          <p className="mt-2 text-label-regular text-text-secondary">1 credit = 1 job live for 30 days</p>
        </section>
        <section className="rounded-lg border border-border-default bg-white p-5">
          <p className="text-label-medium text-text-secondary">Free allowance</p>
          <p className="mt-2 text-display-small-semibold">1 of {FREE_JOB_ALLOWANCE} free jobs used</p>
          <p className="mt-2 text-label-regular text-text-secondary">Resets on 1 Nov</p>
        </section>
      </div>
      <section className="mt-16 rounded-lg border border-border-default bg-white p-5">
        <h2 className="text-body-semibold">How credits work</h2>
        <p className="mt-2 text-body-sm-regular text-text-secondary">Each month you can keep a set number of jobs live for free. Beyond that, posting or renewing a job uses 1 credit. Pausing doesn’t refund credits; closing early doesn’t either. Prices shown may change. TODO: prices are unset until billing is decided.</p>
      </section>
      <div className="mt-16 grid gap-16 lg:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <section key={pack.credits} className="rounded-lg border border-border-default bg-white p-5">
            <h2 className="text-body-semibold">{pack.credits} credits</h2>
            <p className="mt-2 text-display-small-semibold">{pack.priceLabel}</p>
            <p className="mt-2 text-body-sm-regular text-text-secondary">{pack.blurb}</p>
            <Button className="mt-16 w-full" variant="outline" onClick={() => undefined}>Buy pack</Button>
          </section>
        ))}
      </div>
      <section className="mt-16 overflow-hidden rounded-lg border border-border-default bg-white">
        <table className="w-full min-w-[640px] text-left text-body-sm-regular">
          <thead className="text-label-medium text-text-secondary">
            <tr>
              {["Date", "Description", "Credits", "Balance"].map((label) => <th key={label} className="px-16 py-3 font-medium">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((row) => (
              <tr key={row.description} className="border-t border-border-default">
                <td className="px-16 py-3">{row.date}</td>
                <td className="px-16 py-3">{row.description}</td>
                <td className="px-16 py-3">{row.credits}</td>
                <td className="px-16 py-3">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
