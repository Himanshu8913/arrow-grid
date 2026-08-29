import { AchievementsPanel } from "@/components/profile";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export interface AchievementsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AchievementsDialog({ open, onClose }: AchievementsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Achievements"
      description="Unlock badges by playing matches and puzzles."
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <AchievementsPanel embedded />
    </Dialog>
  );
}
