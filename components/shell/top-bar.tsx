"use client";

import { AlertCircle, Bell, Briefcase, Building2, ChevronDown, Clock, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnchoredMenu } from "@/components/ui/anchored-menu";
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

const notificationIcons = {
  applicant: Briefcase,
  approved: Building2,
  returned: AlertCircle,
  expiring: Clock,
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
  const [notesAnchor, setNotesAnchor] = useState<HTMLButtonElement | null>(null);
  const [accountAnchor, setAccountAnchor] = useState<HTMLButtonElement | null>(null);
  const unread = notifications.some((item) => item.unread);

  return (
    <header className="relative z-30 flex h-[72px] w-full shrink-0 items-center gap-[16px] border-b border-border-default bg-white px-[32px]">
      <button className="shrink-0 lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <p className="min-w-[0px] truncate text-subheading-semibold whitespace-nowrap">{titleFor(pathname)}</p>
      <div className="min-w-[0px] flex-1" />
      <Button href="/post-job" className="h-[40px] shrink-0">
        + Post a Job
      </Button>
      <div>
        <button
          aria-label="Notifications"
          aria-expanded={notesOpen}
          className="relative flex size-[40px] items-center justify-center"
          ref={setNotesAnchor}
          onClick={() => {
            setNotesOpen((open) => !open);
            setAccountOpen(false);
          }}
        >
          <Bell size={18} />
          {unread ? <span className="absolute top-[8px] right-[8px] size-[8px] rounded-full bg-error-default" /> : null}
        </button>
        <AnchoredMenu open={notesOpen} anchor={notesAnchor} onClose={() => setNotesOpen(false)} className="w-[380px] max-w-[calc(100vw-16px)] max-h-[calc(100dvh-80px)] overflow-y-auto rounded-[12px] border border-border-default bg-white py-[8px] shadow-[0_4px_6px_#00000008,0_12px_16px_#00000014]">
          <div className="flex items-center justify-between px-[16px] py-[8px]">
            <p className="text-body-semibold">Notifications</p>
            <button className="text-body-sm-semibold text-brand-primary" onClick={markAllRead}>
              Mark all as read
            </button>
          </div>
          <ul>
            {notifications.map((item) => {
              const Icon = notificationIcons[item.tone];
              return (
                <li key={item.id} className={`flex items-start gap-[12px] px-[16px] py-[12px] ${item.unread ? "bg-primary-primary-50" : ""}`}>
                  <span className="grid size-[40px] shrink-0 place-items-center rounded-full bg-grey-grey-100 text-text-primary"><Icon size={20} /></span>
                  <div className="min-w-0 flex-1 space-y-[2px]">
                    <p className="text-body-sm-semibold text-text-primary">{item.title}{item.unread && <span className="sr-only"> (unread)</span>}</p>
                    {item.body && <p className="text-body-sm-regular text-text-secondary">{item.body}</p>}
                    <p className="text-label-regular text-text-secondary">{item.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </AnchoredMenu>
      </div>
      <div>
        <button
          aria-label="Account menu"
          aria-expanded={accountOpen}
          className="inline-flex items-center gap-[8px]"
          ref={setAccountAnchor}
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
        <AnchoredMenu open={accountOpen} anchor={accountAnchor} onClose={() => setAccountOpen(false)} className="w-[240px] rounded-md border border-border-default bg-white py-[8px] shadow-lg">
          <div className="px-[12px] py-[8px]">
            <p className="text-body-sm-semibold">{EMPLOYER.companyName}</p>
            <p className="text-body-sm-regular text-text-secondary">{EMPLOYER.email}</p>
          </div>
          {[
            ["Company profile", "/company"],
            ["Billing", "/billing"],
            ["Settings", "/settings"],
            ["Help", "/help"],
          ].map(([label, path]) => (
            <Link key={path} href={href(path)} className="block px-[12px] py-[8px] text-body-sm-regular hover:bg-grey-grey-100" onClick={() => setAccountOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/login" className="block px-[12px] py-[8px] text-body-sm-medium text-error-default">
            Logout
          </Link>
        </AnchoredMenu>
      </div>
    </header>
  );
}
