import React from "react";
import { StepProgress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function OnboardingProgress({
  steps,
  currentStep,
  className,
}: OnboardingProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      <StepProgress steps={steps} currentStep={currentStep} />
    </div>
  );
}

export function OnboardingLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className={cn("w-full max-w-md", className)}>
          {children}
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HyperScribe. All rights reserved.</p>
      </footer>
    </div>
  );
} 