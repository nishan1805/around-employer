"use client";

import { Bell, Building2, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EMPLOYER } from "@/lib/fixtures";
import { usePortal } from "@/components/shell/use-portal";

export function Navbar({ onMenu }: { onMenu: () => void; menuOpen?: boolean }) {
  const { notifications, markAllRead, state, href } = usePortal();
  const [notesOpen, setNotesOpen] = useState(state === "notifications");
  const [accountOpen, setAccountOpen] = useState(state === "account-menu");
  const [companyOpen, setCompanyOpen] = useState(false);
  const unread = notifications.some((item) => item.unread);

  return (
    <header className="flex h-[72px] items-center gap-3 border-b border-border-default bg-white px-16 sm:px-6">
      <button className="lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
      <div className="relative">
        <button
          aria-haspopup="listbox"
          aria-expanded={companyOpen}
          onClick={() => {
            setCompanyOpen((open) => !open);
            setNotesOpen(false);
            setAccountOpen(false);
          }}
          className="inline-flex h-10 max-w-[240px] items-center gap-2 rounded-full border border-border-default bg-white px-3 text-body-sm-medium"
        >
          <Building2 size={16} className="text-brand-primary" />
          <span className="truncate">{EMPLOYER.companyName}</span>
          <ChevronDown size={14} className="text-text-secondary" />
        </button>
        {companyOpen ? (
          <div role="listbox" className="absolute left-0 z-30 mt-2 w-256 rounded-md border border-border-default bg-white py-1 shadow-lg">
            <p className="px-3 py-2 text-label-medium text-text-secondary">Company</p>
            <button role="option" aria-selected className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm-regular hover:bg-grey-grey-100">
              <Building2 size={16} className="text-brand-primary" />
              {EMPLOYER.companyName}
            </button>
          </div>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border-default"
            onClick={() => {
              setNotesOpen((open) => !open);
              setAccountOpen(false);
              setCompanyOpen(false);
            }}
          >
            <Bell size={18} />
            {unread ? <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error-default" /> : null}
          </button>
          {notesOpen ? (
            <div className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,360px)] rounded-md border border-border-default bg-white shadow-lg">
              <div className="flex items-center justify-between px-16 py-3">
                <p className="text-body-semibold">Notifications</p>
                <button className="text-label-medium text-brand-primary" onClick={markAllRead}>
                  Mark all as read
                </button>
              </div>
              <ul>
                {notifications.map((item) => (
                  <li key={item.id} className={`border-t border-border-default px-16 py-3 ${item.unread ? "bg-primary-primary-50" : ""}`}>
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
            onClick={() => {
              setAccountOpen((open) => !open);
              setNotesOpen(false);
              setCompanyOpen(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-label-semibold text-white"
          >
            {EMPLOYER.avatarInitials}
          </button>
          {accountOpen ? (
            <div className="absolute right-0 z-30 mt-2 w-60 rounded-md border border-border-default bg-white py-2 shadow-lg">
              <div className="px-16 py-2">
                <p className="text-body-sm-semibold">{EMPLOYER.companyName}</p>
                <p className="text-body-sm-regular text-text-secondary">{EMPLOYER.email}</p>
              </div>
              {[
                ["Company profile", "/company"],
                ["Billing", "/billing"],
                ["Settings", "/settings"],
                ["Help", "/help"],
              ].map(([label, path]) => (
                <Link key={path} href={href(path)} className="block px-16 py-2 text-body-sm-regular hover:bg-grey-grey-100" onClick={() => setAccountOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href="/login" className="block px-16 py-2 text-body-sm-medium text-error-default">
                Logout
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
