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
  if (pathname.startsWith("/applicants/")) return "Candidate overview";
  return TITLES[pathname] ?? "Around Jobs";
}

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { notifications, markAllRead, state, href } = usePortal();
  const [notesOpen, setNotesOpen] = useState(state === "notifications");
  const [accountOpen, setAccountOpen] = useState(state === "account-menu");
  const unread = notifications.some((item) => item.unread);

  return (
    <header className="flex h-[72px] items-center gap-4 border-b border-border-default bg-white px-6">
      <button className="lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <p className="text-subheading-semibold">{titleFor(pathname)}</p>
      <div className="flex-1" />
      <Button href="/post-job" className="h-10">
        + Post a Job
      </Button>
      <div className="relative">
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full border border-grey-grey-300"
          onClick={() => {
            setNotesOpen((open) => !open);
            setAccountOpen(false);
          }}
        >
          <Bell size={18} />
          {unread ? <span className="absolute top-2 right-2 size-2 rounded-full bg-error-default" /> : null}
        </button>
        {notesOpen ? (
          <div className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,360px)] rounded-md border border-border-default bg-white shadow-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-body-semibold">Notifications</p>
              <button className="text-label-medium text-brand-primary" onClick={markAllRead}>
                Mark all as read
              </button>
            </div>
            <ul>
              {notifications.map((item) => (
                <li key={item.id} className={`border-t border-border-default px-4 py-3 ${item.unread ? "bg-primary-primary-50" : ""}`}>
                  <p className="text-body-sm-semibold">{item.title}</p>
                  <p className="text-body-sm-regular text-text-secondary">{item.body}</p>
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
          className="inline-flex items-center gap-2"
          onClick={() => {
            setAccountOpen((open) => !open);
            setNotesOpen(false);
          }}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-grey-grey-100 text-label-medium text-text-primary">
            {EMPLOYER.avatarInitials}
          </span>
          <span className="hidden text-body-sm-medium sm:inline">{EMPLOYER.companyName}</span>
          <ChevronDown size={16} />
        </button>
        {accountOpen ? (
          <div className="absolute right-0 z-30 mt-2 w-60 rounded-md border border-border-default bg-white py-2 shadow-lg">
            <div className="px-4 py-2">
              <p className="text-body-sm-semibold">{EMPLOYER.companyName}</p>
              <p className="text-body-sm-regular text-text-secondary">{EMPLOYER.email}</p>
            </div>
            {[
              ["Company profile", "/company"],
              ["Billing", "/billing"],
              ["Settings", "/settings"],
              ["Help", "/help"],
            ].map(([label, path]) => (
              <Link key={path} href={href(path)} className="block px-4 py-2 text-body-sm-regular hover:bg-grey-grey-100" onClick={() => setAccountOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/login" className="block px-4 py-2 text-body-sm-medium text-error-default">
              Logout
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
