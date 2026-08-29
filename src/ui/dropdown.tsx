import { type KeyboardEvent, useId, useRef, useState } from "react";

import { useClickOutside } from "@/hooks/use-click-outside";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { cn } from "@/utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly DropdownOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Finds the next enabled option index when navigating with arrow keys.
 * Skips disabled entries and wraps at both ends of the list.
 */
function getNextOptionIndex(
  options: readonly DropdownOption[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) {
    return -1;
  }

  let index = currentIndex;

  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;

    if (!options[index]?.disabled) {
      return index;
    }
  }

  return currentIndex;
}

/**
 * Select-style dropdown for choosing one option from a list.
 */
export function Dropdown({
  value,
  onValueChange,
  options,
  label,
  placeholder = "Select an option",
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const labelId = useId();

  const selectedOption = options.find((option) => option.value === value);
  const selectedIndex = options.findIndex((option) => option.value === value);

  const closeDropdown = () => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const openDropdown = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  useEscapeKey(closeDropdown, isOpen);
  useClickOutside(containerRef, closeDropdown, isOpen);

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) {
      return;
    }

    onValueChange(option.value);
    closeDropdown();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDropdown();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        getNextOptionIndex(options, current, 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        getNextOptionIndex(options, current, -1),
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlightedIndex];

      if (option) {
        selectOption(option);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label ? (
        <label
          id={labelId}
          className="mb-2 block text-left text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-[14px] px-4",
          "bg-bg-card text-left text-[15px] font-semibold text-text-primary",
          "shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-200",
          "hover:bg-bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={cn(!selectedOption && "text-text-muted")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "text-text-muted transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          className={cn(
            "absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl",
            "border border-bg-card bg-bg-surface p-1 shadow-[0_12px_32px_rgba(0,0,0,0.25)]",
            "modal-panel-enter",
          )}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  disabled={option.disabled}
                  className={cn(
                    "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium",
                    "text-text-primary transition-colors",
                    "hover:bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                    isHighlighted && "bg-bg-card",
                    isSelected && "text-accent-primary",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
