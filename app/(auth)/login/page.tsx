"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginView } from "@/components/auth/login-view";

function LoginGate() {
  const state = useSearchParams().get("state") ?? "default";
  return <LoginView state={state} />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginGate />
    </Suspense>
  );
}
