import type { ReactNode } from "react";

import { Badge, type BadgeVariant } from "@/ui/badge";
import { cn } from "@/utils/cn";

export interface SelectionOption {
  value: string;
  label: string;
  description: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  icon?: string;
}

export interface SelectionPickerFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SelectionPickerField({
  label,
  description,
  children,
  className,
}: SelectionPickerFieldProps) {
  return (
    <div className={cn("mx-auto w-full max-w-md text-left", className)}>
      <div className="mb-2">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export interface SelectionOptionCardProps {
  option: SelectionOption;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  layout?: "list" | "tile";
}

export function SelectionOptionCard({
  option,
  isSelected,
  onSelect,
  disabled = false,
  layout = "list",
}: SelectionOptionCardProps) {
  if (layout === "tile") {
    return (
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-full min-h-[108px] flex-col items-start rounded-2xl border px-3 py-3 text-left transition",
          "hover:border-accent-primary/30 hover:bg-bg-card/70",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          "disabled:pointer-events-none disabled:opacity-50",
          isSelected
            ? "border-accent-primary/50 bg-accent-primary/10"
            : "border-bg-card/80 bg-bg-card/35",
        )}
        aria-pressed={isSelected}
        onClick={onSelect}
      >
        {option.icon ? (
          <span aria-hidden="true" className="mb-2 text-xl leading-none">
            {option.icon}
          </span>
        ) : null}
        <span className="font-semibold text-text-primary">{option.label}</span>
        {option.badge ? (
          <Badge
            variant={option.badgeVariant ?? "outline"}
            size="sm"
            className="mt-2"
          >
            {option.badge}
          </Badge>
        ) : null}
        <span className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-muted">
          {option.description}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
        "hover:border-accent-primary/30 hover:bg-bg-card/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "border-accent-primary/50 bg-accent-primary/10"
          : "border-bg-card/80 bg-bg-card/35",
      )}
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
          isSelected
            ? "border-accent-primary bg-accent-primary text-bg-primary"
            : "border-text-muted/40 text-transparent",
        )}
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          {option.icon ? (
            <span aria-hidden="true" className="text-base leading-none">
              {option.icon}
            </span>
          ) : null}
          <span className="font-semibold text-text-primary">{option.label}</span>
          {option.badge ? (
            <Badge variant={option.badgeVariant ?? "outline"} size="sm">
              {option.badge}
            </Badge>
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
          {option.description}
        </span>
      </span>
    </button>
  );
}

export interface SelectionSummaryCardProps {
  label: string;
  option: SelectionOption;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SelectionSummaryCard({
  label,
  option,
  actionLabel = "Change",
  onAction,
  disabled = false,
  className,
}: SelectionSummaryCardProps) {
  return (
    <SelectionPickerField label={label} className={className}>
      <div
        className={cn(
          "rounded-[18px] border border-bg-card/80 bg-bg-card/40 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
          disabled && "opacity-60",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {option.icon ? (
                <span aria-hidden="true" className="text-base leading-none">
                  {option.icon}
                </span>
              ) : null}
              <p className="truncate text-base font-semibold text-text-primary">
                {option.label}
              </p>
              {option.badge ? (
                <Badge variant={option.badgeVariant ?? "outline"} size="sm">
                  {option.badge}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
              {option.description}
            </p>
          </div>
          {onAction ? (
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "shrink-0 rounded-xl border border-bg-card bg-bg-card px-3 py-1.5 text-sm font-semibold text-text-primary transition",
                "hover:bg-bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </SelectionPickerField>
  );
}
