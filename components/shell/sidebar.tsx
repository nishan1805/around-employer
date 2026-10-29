"use client";

import {
  Briefcase,
  Building2,
  CircleHelp,
  CreditCard,
  FilePlus2,
  LayoutGrid,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePortal } from "@/components/shell/use-portal";

const MAIN = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/post-job", label: "Post a Job", icon: FilePlus2 },
  { href: "/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/applicants", label: "Applicants", icon: Users },
  { href: "/company", label: "Company Profile", icon: Building2 },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

const FOOTER = [
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
  { href: "/help", label: "Help & Support", icon: CircleHelp },
];

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
  mobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const { href } = usePortal();
  const compact = collapsed && !mobile;

  function active(path: string) {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border-default bg-white",
        mobile ? "w-[240px]" : compact ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className="flex h-[72px] items-center justify-between px-[20px]">
        {compact ? null : (
          <Link href={href("/")} className="text-display-small-bold leading-none tracking-[-0.04em] text-brand-primary">
            around
          </Link>
        )}
        <button aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} onClick={onToggle} className="text-text-secondary">
          {compact ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>
      <nav className="flex flex-1 flex-col px-[12px]">
        <div className="flex flex-col gap-[4px]">
          {MAIN.map((item) => (
            <NavItem key={item.href} {...item} href={href(item.href)} active={active(item.href)} compact={compact} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="mt-auto border-t border-border-default pt-[12px]">
          {FOOTER.map((item) => (
            <NavItem key={item.href} {...item} href={href(item.href)} active={active(item.href)} compact={compact} onNavigate={onNavigate} />
          ))}
          <Link
            href="/login"
            onClick={onNavigate}
            className="mt-[4px] flex h-[44px] items-center gap-[12px] rounded-md px-[12px] text-body-sm-medium text-error-default"
          >
            <LogOut size={18} />
            {compact ? null : "Logout"}
          </Link>
        </div>
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  compact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  compact: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      title={label}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-[44px] items-center gap-[12px] rounded-md px-[12px] text-body-sm-medium",
        active ? "bg-primary-primary-50 text-brand-primary" : "text-text-primary hover:bg-grey-grey-100",
        compact && "justify-center px-[0px]",
      )}
    >
      <Icon size={18} />
      {compact ? null : label}
    </Link>
  );
}
