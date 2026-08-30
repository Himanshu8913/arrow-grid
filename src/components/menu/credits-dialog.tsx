import type { ReactNode } from "react";

import {
  CREATOR_LINKS,
  CREATOR_NAME,
  getAppName,
  getAppVersion,
} from "@/constants/app";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { cn } from "@/utils/cn";

export interface CreditsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Credits and attribution for the game.
 */
export function CreditsDialog({ open, onClose }: CreditsDialogProps) {
  const appName = getAppName();
  const appVersion = getAppVersion();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Credits"
      description={`${appName} — a strategy puzzle game.`}
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-5 text-sm">
        <CreditsSection title="Game">
          <p className="text-text-primary">
            <span className="font-semibold">{appName}</span>
            <span className="text-text-muted"> · v{appVersion}</span>
          </p>
          <p className="mt-2 leading-relaxed text-text-muted">
            Rotate arrows, guide the orb, and outplay your opponent in puzzles,
            daily challenges, and versus matches.
          </p>
        </CreditsSection>

        <CreditsSection title="Created by">
          <p className="font-semibold text-text-primary">{CREATOR_NAME}</p>
          <p className="mt-2 leading-relaxed text-text-muted">
            Designed and developed as a browser-based strategy puzzle experience.
          </p>
        </CreditsSection>

        <CreditsSection title="Connect">
          <div className="grid gap-2">
            <CreatorLinkCard
              icon="🐙"
              label={CREATOR_LINKS.github.label}
              handle={CREATOR_LINKS.github.handle}
              href={CREATOR_LINKS.github.href}
            />
            <CreatorLinkCard
              icon="💼"
              label={CREATOR_LINKS.linkedin.label}
              handle={CREATOR_LINKS.linkedin.handle}
              href={CREATOR_LINKS.linkedin.href}
            />
          </div>
        </CreditsSection>

        <p className="border-t border-bg-card/60 pt-4 text-xs text-text-muted">
          Thank you for playing {appName}.
        </p>
      </div>
    </Dialog>
  );
}

function CreditsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-bg-card/70 bg-bg-card/25 px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function CreatorLinkCard({
  icon,
  label,
  handle,
  href,
}: {
  icon: string;
  label: string;
  handle: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-bg-card/80 bg-bg-card/40 px-3 py-2.5",
        "transition-colors hover:border-accent-primary/40 hover:bg-accent-primary/10",
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-surface text-base"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <span className="block truncate font-semibold text-text-primary group-hover:text-accent-primary">
          {handle}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="text-xs text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-primary"
      >
        ↗
      </span>
    </a>
  );
}
