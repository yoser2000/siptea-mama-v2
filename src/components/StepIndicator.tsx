import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  current: number;
  total: number;
}

const StepIndicator = ({ current, total }: StepIndicatorProps) => (
  <div className="flex gap-2">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-1.5 rounded-full flex-1 transition-all duration-300",
          i < current ? "bg-primary" : "bg-border"
        )}
      />
    ))}
  </div>
);

export default StepIndicator;