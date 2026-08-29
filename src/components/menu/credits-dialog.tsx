import { getAppVersion } from "@/constants/app";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export interface CreditsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Credits and attribution for the game.
 */
export function CreditsDialog({ open, onClose }: CreditsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Credits"
      description="Arrow Grid — a strategy puzzle game."
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4 text-sm text-text-muted">
        <p>Designed and developed by Himanshu Gupta.</p>
        <p className="text-xs">Version {getAppVersion()}</p>
      </div>
    </Dialog>
  );
}
