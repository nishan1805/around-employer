"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Banner } from "@/components/ui/feedback";
import { TopBar } from "@/components/shell/top-bar";
import { Sidebar } from "@/components/shell/sidebar";
import { StateSwitcher } from "@/components/shell/state-switcher";
import { usePortal } from "@/components/shell/use-portal";

/** Centred content column. Lists and tables may grow to 1440; forms stay narrower. */
function contentMax(pathname: string) {
  if (pathname.startsWith("/post-job")) return "max-w-[768px]";
  if (pathname.startsWith("/settings")) return "max-w-[1040px]";
  if (pathname === "/jobs" || pathname === "/applicants" || /^\/jobs\/[^/]+\/applicants$/.test(pathname) || pathname === "/billing") {
    return "max-w-[1440px]";
  }
  return "max-w-[1280px]";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account } = usePortal();

  return (
    <div className="mx-auto flex h-screen w-full max-w-[1920px] bg-white">
      <div className="hidden h-full shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      </div>
      {mobileOpen ? (
        <div className="fixed inset-[0px] z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-[0px] bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">
            <Sidebar collapsed={false} mobile onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-[0px] flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="min-w-[0px] flex-1 overflow-x-hidden overflow-y-auto bg-dashboard-bg">
          <div className={`mx-auto w-full px-[32px] py-[32px] ${contentMax(pathname)}`}>
            {account === "Suspended" ? (
              <div className="mb-[16px]">
                <Banner
                  tone="danger"
                  title="Account suspended"
                  body="This is an account-level restriction, separate from company verification. You can review drafts, but posting and publishing stay locked."
                />
              </div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
      <StateSwitcher />
    </div>
  );
}
