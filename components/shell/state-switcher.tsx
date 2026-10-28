"use client";

import { useState } from "react";
import { statesForPath } from "@/lib/scenarios";
import { usePortal } from "@/components/shell/use-portal";

export function StateSwitcher() {
  const { pathname, state, account, verification, pushState, setQuery } = usePortal();
  const [open, setOpen] = useState(false);
  const dev = process.env.NODE_ENV !== "production";
  if (!dev) return null;
  const states = statesForPath(pathname);

  return (
    <div className="fixed bottom-[16px] left-[16px] z-50">
      {open ? (
        <div className="mb-[8px] max-h-[70vh] w-[280px] overflow-auto rounded-md border border-border-default bg-white p-[12px] shadow-lg">
          <p className="text-label-semibold tracking-wide text-text-secondary uppercase">Dev states</p>
          <div className="mt-[8px] flex flex-col">
            {states.map((item) => (
              <button
                key={item.id}
                onClick={() => pushState(item.id)}
                className={`rounded-md px-[8px] py-[6px] text-left text-body-sm-regular ${state === item.id ? "bg-primary-primary-50 text-brand-primary" : "hover:bg-grey-grey-100"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="mt-[12px] block text-label-medium text-text-secondary">
            Account
            <select className="mt-[4px] h-[36px] w-full rounded-sm border border-border-default px-[8px] text-body-sm-regular" value={account} onChange={(event) => setQuery("account", event.target.value)}>
              <option>Active</option>
              <option>Suspended</option>
            </select>
          </label>
          <label className="mt-[8px] block text-label-medium text-text-secondary">
            Verification
            <select
              className="mt-[4px] h-[36px] w-full rounded-sm border border-border-default px-[8px] text-body-sm-regular"
              value={verification}
              onChange={(event) => setQuery("verification", event.target.value)}
            >
              {["not_started", "in_progress", "pending", "verified", "additional_info_required", "rejected"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      <button onClick={() => setOpen((value) => !value)} className="rounded-full bg-grey-grey-900 px-[12px] py-[8px] text-label-semibold text-white">
        States
      </button>
    </div>
  );
}
