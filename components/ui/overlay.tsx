"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Scrim({ onClose, children, className }: { onClose?: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-[0px] z-40 flex items-start justify-center overflow-y-auto p-[16px] sm:p-[32px]">
      <button aria-label="Close dialog" className="absolute inset-[0px] bg-black/40" onClick={onClose} />
      <div className={cn("relative z-10 my-auto w-full max-w-[560px]", className)}>{children}</div>
    </div>
  );
}

export function ModalCard({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Scrim onClose={onClose} className={wide ? "max-w-[640px]" : undefined}>
      <div className="rounded-md bg-white p-[24px] shadow-lg">
        <div className="mb-[16px] flex items-center gap-[12px]">
          <h2 className="flex-1 text-subheading-semibold">{title}</h2>
          {onClose ? (
            <button aria-label="Close" onClick={onClose} className="text-text-secondary">
              <X size={20} />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </Scrim>
  );
}

export function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-[0px] z-40 flex justify-end">
      <button aria-label="Close preview" className="absolute inset-[0px] bg-black/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-[448px] flex-col bg-white shadow-lg">
        <div className="flex items-center gap-[12px] border-b border-border-default px-[24px] py-[20px]">
          <h2 className="flex-1 text-subheading-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">{children}</div>
      </aside>
    </div>
  );
}
