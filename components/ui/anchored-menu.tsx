"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders a menu on document.body so page overflow and stacking can't cover it.
 * Flips above the anchor when there isn't room below.
 */
export function AnchoredMenu({
  open,
  anchor,
  onClose,
  children,
  align = "end",
  className = "",
}: {
  open: boolean;
  anchor: HTMLElement | null;
  onClose?: () => void;
  children: ReactNode;
  align?: "end" | "start";
  className?: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ top: 0, left: 0, ready: false });

  useLayoutEffect(() => {
    if (!open || !anchor) return;
    function place() {
      const menu = menuRef.current;
      if (!anchor || !menu) return;
      const rect = anchor.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const flip = spaceBelow < menuRect.height + gap && rect.top > menuRect.height + gap;
      const top = flip ? rect.top - menuRect.height - gap : rect.bottom + gap;
      const rawLeft = align === "end" ? rect.right - menuRect.width : rect.left;
      const left = Math.max(8, Math.min(rawLeft, window.innerWidth - menuRect.width - 8));
      setBox({ top: Math.max(8, top), left, ready: true });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, align]);

  useEffect(() => {
    if (!open || !onClose) return;
    const close = onClose;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || anchor?.contains(target)) return;
      close();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose, anchor]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: box.top, left: box.left, zIndex: 80, visibility: box.ready ? "visible" : "hidden" }}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}
