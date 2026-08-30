/**
 * Application metadata surfaced in menus, profile, and credits.
 */
export function getAppName(): string {
  return import.meta.env.VITE_APP_NAME ?? "Arrow Grid";
}

export function getAppVersion(): string {
  return import.meta.env.VITE_APP_VERSION ?? "1.1.0";
}
