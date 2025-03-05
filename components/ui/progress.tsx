import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        success: "bg-success/20",
        destructive: "bg-destructive/20",
        warning: "bg-warning/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const progressIndicatorVariants = cva("h-full w-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-success",
      destructive: "bg-destructive",
      warning: "bg-warning",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  indicatorVariant?: VariantProps<typeof progressIndicatorVariants>["variant"];
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, indicatorVariant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        progressIndicatorVariants({
          variant: indicatorVariant || variant,
        })
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

export function ProgressWithText({
  value,
  variant,
  indicatorVariant,
  className,
  label,
  ...props
}: ProgressProps & { label?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>{label || "Progress"}</span>
        <span>{Math.round(value || 0)}%</span>
      </div>
      <Progress
        value={value}
        variant={variant}
        indicatorVariant={indicatorVariant}
        {...props}
      />
    </div>
  );
}

export function StepProgress({
  steps,
  currentStep,
  className,
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={`step-${index}-${step.substring(0, 5)}`}
            className={cn(
              "flex flex-col items-center space-y-2",
              index === currentStep
                ? "text-primary"
                : index < currentStep
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                index === currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "border-muted-foreground bg-muted"
                  : "border-muted-foreground/50"
              )}
            >
              {index + 1}
            </div>
            <span className="text-xs">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 