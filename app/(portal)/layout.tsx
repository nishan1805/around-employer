import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-background-secondary" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
