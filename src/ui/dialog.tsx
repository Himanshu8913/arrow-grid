import { type ReactNode, useId } from "react";

import { Button } from "@/ui/button";
import { Modal, type ModalProps } from "@/ui/modal";
import { cn } from "@/utils/cn";

export interface DialogProps extends Pick<
  ModalProps,
  "open" | "onClose" | "closeOnOutsideClick" | "className"
> {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  size?: "default" | "large";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnOutsideClick = true,
  showCloseButton = true,
  size = "default",
  className,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeOnOutsideClick={closeOnOutsideClick}
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
      className={cn(
        "flex max-h-[min(90dvh,calc(100dvh-2rem))] flex-col overflow-hidden p-0 sm:p-0",
        size === "large" && "max-w-xl",
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-bg-card/60 px-5 py-5 sm:px-8 sm:py-6">
        <div className="space-y-1.5 text-left">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-sm text-text-muted">
              {description}
            </p>
          ) : null}
        </div>

        {showCloseButton ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            className="shrink-0"
            onClick={onClose}
          >
            ✕
          </Button>
        ) : null}
      </div>

      {children ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8">
          <div className="text-left">{children}</div>
        </div>
      ) : null}

      {footer ? (
        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-bg-card/60 px-5 py-4 sm:px-8">
          {footer}
        </div>
      ) : null}
    </Modal>
  );
}
