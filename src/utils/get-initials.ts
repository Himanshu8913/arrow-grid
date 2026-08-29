/**
 * Derives up to two initials from a display name.
 * Handles single names, multi-word names, and extra whitespace.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0] ?? "";
  const lastInitial = parts[parts.length - 1][0] ?? "";

  return `${firstInitial}${lastInitial}`.toUpperCase();
}
