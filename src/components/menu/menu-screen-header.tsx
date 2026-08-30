import { Button } from "@/ui/button";

export interface MenuScreenHeaderProps {
  title: string;
  onBack: () => void;
}

/**
 * Consistent back + title header for secondary menu screens.
 */
export function MenuScreenHeader({ title, onBack }: MenuScreenHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        ← Back
      </Button>
      <h1 className="flex-1 text-center text-lg font-bold text-text-primary sm:text-xl">
        {title}
      </h1>
      <div className="w-[72px]" aria-hidden />
    </div>
  );
}
