"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ModalCard, Scrim } from "@/components/ui/overlay";

/** Figma: Confirm Dialog. Code Connect target. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  compact = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  compact?: boolean;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  const content = (
    <>
      <div className="text-body-sm-regular text-text-secondary">{body}</div>
      <div className={`flex justify-end ${compact ? "gap-[12px]" : "mt-[16px] gap-[8px]"}`}>
        <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </>
  );
  if (compact) {
    return (
      <Scrim onClose={onCancel} className="max-w-[480px]">
        <div role="dialog" aria-modal="true" aria-label={title} className="space-y-[16px] rounded-[12px] bg-white p-[24px]">
          <h2 className="text-subheading-semibold">{title}</h2>
          {content}
        </div>
      </Scrim>
    );
  }
  return <ModalCard title={title} onClose={onCancel}>{content}</ModalCard>;
}
