"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useEmployer } from "@/components/employer/provider";
import { accountFromState, verificationFromState } from "@/lib/scenarios";
import type { AccountStatus, CompanyVerificationStatus } from "@/lib/types";

export function usePortal() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const employer = useEmployer();
  const state = params.get("state") ?? "default";

  const account = (params.get("account") as AccountStatus | null) ?? accountFromState(state) ?? "Active";
  const verification =
    (params.get("verification") as CompanyVerificationStatus | null) ??
    verificationFromState(state) ??
    employer.verificationStatus;

  const href = useMemo(() => {
    return (path: string, nextState?: string) => {
      const query = new URLSearchParams();
      if (params.get("account")) query.set("account", params.get("account") as string);
      if (params.get("verification")) query.set("verification", params.get("verification") as string);
      if (nextState && nextState !== "default") query.set("state", nextState);
      const text = query.toString();
      return text ? `${path}?${text}` : path;
    };
  }, [params]);

  function pushState(next: string) {
    const query = new URLSearchParams(params.toString());
    if (next === "default") query.delete("state");
    else query.set("state", next);
    const text = query.toString();
    router.push(text ? `${pathname}?${text}` : pathname);
  }

  function setQuery(key: "account" | "verification", value: string) {
    const query = new URLSearchParams(params.toString());
    if (!value) query.delete(key);
    else query.set(key, value);
    const text = query.toString();
    router.push(text ? `${pathname}?${text}` : pathname);
  }

  return { state, account, verification, href, pushState, setQuery, pathname, ...employer };
}
