import { type RefObject, useEffect } from "react";

/**
 * Calls `onClickOutside` when the user clicks outside the referenced element.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  isEnabled = true,
) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node) || !ref.current) {
        return;
      }

      if (!ref.current.contains(target)) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isEnabled, onClickOutside, ref]);
}
