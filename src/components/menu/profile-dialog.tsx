import { ProfilePanel } from "@/components/profile/profile-panel";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Player profile editor opened from the main menu.
 */
export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Profile"
      description="Your stats, cosmetics, achievements, and display name."
      size="large"
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <ProfilePanel />
    </Dialog>
  );
}
