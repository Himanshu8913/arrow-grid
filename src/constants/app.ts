/**
 * Application metadata surfaced in menus, profile, and credits.
 */
export function getAppName(): string {
  return import.meta.env.VITE_APP_NAME ?? "Arrow Grid";
}

export function getAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION ?? APP_VERSION;
}

/** Fallback app version when env injection is unavailable (keep in sync with package.json). */
export const APP_VERSION = "1.1.0";

export const CREATOR_NAME = "Himanshu Gupta";

export const CREATOR_LINKS = {
  github: {
    label: "GitHub",
    handle: "Himanshu8913",
    href: "https://github.com/Himanshu8913",
  },
  linkedin: {
    label: "LinkedIn",
    handle: "imhimanshu-gupta",
    href: "https://www.linkedin.com/in/imhimanshu-gupta/",
  },
} as const;
