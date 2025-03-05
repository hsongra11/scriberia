import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/progress";

interface WelcomeProps {
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function Welcome({ onNext, currentStep, totalSteps }: WelcomeProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative size-16">
            <Image
              src="/logo.png"
              alt="HyperScribe Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome to HyperScribe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Your AI-powered note-taking and task management app. Let&apos;s set up your
          account to get started.
        </p>
        
        <div className="grid grid-cols-1 gap-4 mt-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">1</span>
            </div>
            <div>
              <h3 className="font-medium">Choose your preferences</h3>
              <p className="text-sm text-muted-foreground">
                Select your favorite note categories and templates
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">2</span>
            </div>
            <div>
              <h3 className="font-medium">Customize your workspace</h3>
              <p className="text-sm text-muted-foreground">
                Set up your workspace with your preferred settings
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="shrink-0 size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">3</span>
            </div>
            <div>
              <h3 className="font-medium">Start creating</h3>
              <p className="text-sm text-muted-foreground">
                Begin creating notes, tasks, and more
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <StepProgress steps={steps} currentStep={currentStep} />
        <Button onClick={onNext} className="w-full">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
} 