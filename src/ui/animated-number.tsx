import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { cn } from "@/utils/cn";

export interface AnimatedNumberProps {
  value: number;
  className?: string;
}

/**
 * Renders a number that eases between value changes.
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const displayValue = useAnimatedNumber(value);

  return <span className={cn("tabular-nums", className)}>{displayValue}</span>;
}
