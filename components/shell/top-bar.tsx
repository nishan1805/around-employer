"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EMPLOYER } from "@/lib/fixtures";
import { usePortal } from "@/components/shell/use-portal";

/**
 * Employer Top Bar (Figma 1888:12665).
 * Page title on the left. Post a Job, notifications, and the Raipur Builder
 * identity on the right. This is the only top bar in the employer app.
 */
const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/jobs": "My Jobs",
  "/post-job": "Post a Job",
  "/applicants": "Applicants",
  "/company": "Company Profile",
  "/billing": "Billing",
  "/settings": "Settings",
  "/help": "Help & Support",
  "/verification": "Verification",
};

function titleFor(pathname: string) {
  if (pathname.startsWith("/jobs/") && pathname.endsWith("/applicants")) return "Applicants";
  if (pathname.startsWith("/jobs/")) return "Job details";
  if (pathname.startsWith("/applicants/")) return "Candidate profile";
  return TITLES[pathname] ?? "Around Jobs";
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { notifications, markAllRead, state, href } = usePortal();
  const [notesOpen, setNotesOpen] = useState(state === "notifications");
  const [accountOpen, setAccountOpen] = useState(state === "account-menu");
  const unread = notifications.some((item) => item.unread);

  return (
    <header className="flex h-[72px] w-full shrink-0 items-center gap-[16px] overflow-hidden border-b border-border-default bg-white px-[32px]">
      <button className="shrink-0 lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <p className="min-w-[0px] truncate text-subheading-semibold whitespace-nowrap">{titleFor(pathname)}</p>
      <div className="min-w-[0px] flex-1" />
      <Button href="/post-job" className="h-[40px] shrink-0">
        + Post a Job
      </Button>
      <div className="relative">
        <button
          aria-label="Notifications"
          className="relative flex size-[40px] items-center justify-center"
          onClick={() => {
            setNotesOpen((open) => !open);
            setAccountOpen(false);
          }}
        >
          <Bell size={18} />
          {unread ? <span className="absolute top-[8px] right-[8px] size-[8px] rounded-full bg-error-default" /> : null}
        </button>
        {notesOpen ? (
          <div className="absolute right-[0px] z-30 mt-[8px] w-[min(100vw-2rem,360px)] rounded-md border border-border-default bg-white shadow-lg">
            <div className="flex items-center justify-between px-[16px] py-[12px]">
              <p className="text-body-semibold">Notifications</p>
              <button className="text-label-medium text-brand-primary" onClick={markAllRead}>
                Mark all as read
              </button>
            </div>
            <ul>
              {notifications.map((item) => (
                <li key={item.id} className={`border-t border-border-default px-[16px] py-[12px] ${item.unread ? "bg-primary-primary-50" : ""}`}>
                  <p className="text-body-sm-semibold">{item.title}</p>
                  {item.body ? <p className="text-body-sm-regular text-text-secondary">{item.body}</p> : null}
                  <p className="text-label-regular text-text-tertiary">{item.time}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="relative">
        <button
          aria-label="Account menu"
          aria-expanded={accountOpen}
          className="inline-flex items-center gap-[8px]"
          onClick={() => {
            setAccountOpen((open) => !open);
            setNotesOpen(false);
          }}
        >
          <span className="flex size-[40px] items-center justify-center rounded-full bg-grey-grey-100 text-label-medium text-text-primary">
            {EMPLOYER.avatarInitials}
          </span>
          <span className="hidden text-body-sm-medium sm:inline">{EMPLOYER.companyName}</span>
          <ChevronDown size={16} />
        </button>
        {accountOpen ? (
          <div className="absolute right-[0px] z-30 mt-[8px] w-[240px] rounded-md border border-border-default bg-white py-[8px] shadow-lg">
            <div className="px-[4px] py-[8px]">
              <p className="text-body-sm-semibold">{EMPLOYER.companyName}</p>
              <p className="text-body-sm-regular text-text-secondary">{EMPLOYER.email}</p>
            </div>
            {[
              ["Company profile", "/company"],
              ["Billing", "/billing"],
              ["Settings", "/settings"],
              ["Help", "/help"],
            ].map(([label, path]) => (
              <Link key={path} href={href(path)} className="block px-[4px] py-[8px] text-body-sm-regular hover:bg-grey-grey-100" onClick={() => setAccountOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/login" className="block px-[4px] py-[8px] text-body-sm-medium text-error-default">
              Logout
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
