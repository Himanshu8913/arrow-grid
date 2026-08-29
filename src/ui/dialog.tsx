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
      className={cn("sm:p-8", className)}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2 text-left">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="text-text-muted">
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

      {children ? <div className="text-left">{children}</div> : null}

      {footer ? (
        <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>
      ) : null}
    </Modal>
  );
}
