import { AlertCircle, FileSearch, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export { Banner } from "@/components/ui/banner";

export function EmptyState({
  title,
  body,
  action,
  icon = "inbox",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: "inbox" | "search";
}) {
  const Icon = icon === "search" ? FileSearch : Inbox;
  return (
    <div className="flex flex-col items-center px-6 py-64 text-center">
      <div className="mb-16 flex h-28 w-28 items-center justify-center rounded-full bg-primary-primary-50 text-brand-primary">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-body-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-body-sm-regular text-text-secondary">{body}</p>
      {action ? <div className="mt-16">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-16 flex h-48 w-48 items-center justify-center rounded-full border border-border-default text-text-secondary">
        <AlertCircle size={22} />
      </div>
      <h2 className="text-body-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-body-sm-regular text-text-secondary">{body}</p>
      <Button className="mt-16" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-grey-grey-200 ${className ?? ""}`} />;
}
