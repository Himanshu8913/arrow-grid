import type { AppLanguage } from "@/types/settings";

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
] as const satisfies ReadonlyArray<{ value: AppLanguage; label: string }>;
