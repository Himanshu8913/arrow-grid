import { CosmeticsPanel } from "@/components/cosmetics/cosmetics-panel";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export interface CosmeticsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CosmeticsDialog({ open, onClose }: CosmeticsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cosmetics"
      description="Spend coins to unlock visuals. Achievements unlock select items for free."
      size="large"
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <CosmeticsPanel embedded />
    </Dialog>
  );
}
