"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ModalCard } from "@/components/ui/overlay";

/** Figma: Confirm Dialog. Code Connect target. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <ModalCard title={title} onClose={onCancel}>
      <div className="text-body-sm-regular text-text-secondary">{body}</div>
      <div className="mt-[16px] flex justify-end gap-[8px]">
        <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </ModalCard>
  );
}
