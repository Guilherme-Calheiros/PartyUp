import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterBarProps<T extends string> = {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

export default function FilterBar<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: FilterBarProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={option.value === value ? "default" : "outline"}
          size="lg"
          className="rounded-full px-4"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
