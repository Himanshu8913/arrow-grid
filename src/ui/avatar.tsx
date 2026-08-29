import { type ComponentProps, useState } from "react";

import { getInitials } from "@/utils/get-initials";
import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
} as const;

export type AvatarSize = keyof typeof sizeStyles;

export interface AvatarProps extends ComponentProps<"div"> {
  /** Image URL. Falls back to initials when missing or failed to load. */
  src?: string;
  /** Accessible label for the avatar image. */
  alt: string;
  /** Display name used for initials fallback. Defaults to `alt`. */
  name?: string;
  size?: AvatarSize;
}

/**
 * Circular user avatar with image support and initials fallback.
 */
export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const displayName = name ?? alt;
  const showImage = Boolean(src) && !hasImageError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-accent-primary/20 font-semibold text-accent-primary ring-2 ring-bg-surface",
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(displayName)}</span>
      )}
    </div>
  );
}
