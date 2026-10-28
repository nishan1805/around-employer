"use client";

import { useState, type ReactNode } from "react";
import { Banner } from "@/components/ui/feedback";
import { TopBar } from "@/components/shell/top-bar";
import { Sidebar } from "@/components/shell/sidebar";
import { StateSwitcher } from "@/components/shell/state-switcher";
import { usePortal } from "@/components/shell/use-portal";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account } = usePortal();

  return (
    <div className="flex h-screen bg-white">
      <div className="hidden lg:block">
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
        <main className="flex-1 overflow-y-auto bg-dashboard-bg">
          {account === "Suspended" ? (
            <div className="px-[16px] pt-[16px] sm:px-[32px]">
              <Banner
                tone="danger"
                title="Account suspended"
                body="This is an account-level restriction, separate from company verification. You can review drafts, but posting and publishing stay locked."
              />
            </div>
          ) : null}
          {children}
        </main>
      </div>
      <StateSwitcher />
    </div>
  );
}
