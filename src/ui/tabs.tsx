import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
} from "react";

import { cn } from "@/utils/cn";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: readonly TabItem[];
  className?: string;
}

/**
 * Returns the next enabled tab index when navigating with arrow keys.
 */
function getNextTabIndex(
  items: readonly TabItem[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (items.length === 0) {
    return -1;
  }

  let index = currentIndex;

  for (let step = 0; step < items.length; step += 1) {
    index = (index + direction + items.length) % items.length;

    if (!items[index]?.disabled) {
      return index;
    }
  }

  return currentIndex;
}

/**
 * Returns the first enabled tab index, or `-1` when none are available.
 */
function getFirstEnabledTabIndex(items: readonly TabItem[]): number {
  return items.findIndex((item) => !item.disabled);
}

/**
 * Returns the last enabled tab index, or `-1` when none are available.
 */
function getLastEnabledTabIndex(items: readonly TabItem[]): number {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

/**
 * Accessible tabbed interface with keyboard navigation.
 */
export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = items.findIndex((item) => item.value === value);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : items[0];

  const focusTabAtIndex = (index: number) => {
    tabRefs.current[index]?.focus();
  };

  const selectTabAtIndex = (index: number) => {
    const item = items[index];

    if (!item || item.disabled) {
      return;
    }

    onValueChange(item.value);
    focusTabAtIndex(index);
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0 || activeIndex < 0) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = getNextTabIndex(items, activeIndex, 1);
      selectTabAtIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const nextIndex = getNextTabIndex(items, activeIndex, -1);
      selectTabAtIndex(nextIndex);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectTabAtIndex(getFirstEnabledTabIndex(items));
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      selectTabAtIndex(getLastEnabledTabIndex(items));
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-bg-card p-1"
        onKeyDown={handleListKeyDown}
      >
        {items.map((item, index) => {
          const isSelected = item.value === value;
          const tabId = `${baseId}-tab-${item.value}`;
          const panelId = `${baseId}-panel-${item.value}`;

          return (
            <button
              key={item.value}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isSelected}
              aria-controls={panelId}
              disabled={item.disabled}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isSelected
                  ? "scale-[1.02] bg-bg-surface text-text-primary shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                  : "text-text-muted hover:bg-bg-surface/40 hover:text-text-primary",
              )}
              onClick={() => selectTabAtIndex(index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {activeItem ? (
        <div
          key={activeItem.value}
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.value}`}
          aria-labelledby={`${baseId}-tab-${activeItem.value}`}
          className="tab-panel-enter mt-4 text-left"
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}
