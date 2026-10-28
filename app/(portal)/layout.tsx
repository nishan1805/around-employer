import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-dashboard-bg" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
