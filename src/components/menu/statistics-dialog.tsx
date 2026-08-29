import { StatisticsPanel } from "@/components/profile";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export interface StatisticsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StatisticsDialog({ open, onClose }: StatisticsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Statistics"
      description="Your lifetime performance on this device."
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      <StatisticsPanel embedded />
    </Dialog>
  );
}
