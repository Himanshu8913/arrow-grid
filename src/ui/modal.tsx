import { type ComponentProps, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { cn } from "@/utils/cn";

export interface ModalProps extends Omit<ComponentProps<"div">, "children"> {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  labelledBy?: string;
  describedBy?: string;
}

export function Modal({
  open,
  onClose,
  children,
  closeOnOutsideClick = true,
  labelledBy,
  describedBy,
  className,
  ...props
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) {
      return;
    }

    panelRef.current?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="modal-backdrop-enter absolute inset-0 bg-bg-primary/70 backdrop-blur-sm"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "modal-panel-enter relative z-10 w-full max-w-lg",
          "rounded-3xl border border-white/10 bg-bg-surface/85 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-md",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
