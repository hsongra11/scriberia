import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StepProgress } from "@/components/ui/progress";
import { Check, FileText, Calendar, ListTodo, Brain, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface CategorySelectorProps {
  onNext: (selectedCategories: string[]) => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function CategorySelector({ onNext, onBack, currentStep, totalSteps }: CategorySelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const steps = Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`);

  const categories: CategoryOption[] = [
    {
      id: "brain-dump",
      name: "Brain Dump",
      description: "Quick capture of thoughts and ideas",
      icon: Brain,
    },
    {
      id: "journal",
      name: "Journal",
      description: "Daily reflections and experiences",
      icon: Calendar,
    },
    {
      id: "to-do",
      name: "To-Do Lists",
      description: "Task management and checklists",
      icon: ListTodo,
    },
    {
      id: "mood-tracking",
      name: "Mood Tracking",
      description: "Track emotions and mental well-being",
      icon: Smile,
    },
    {
      id: "custom",
      name: "Custom Notes",
      description: "Flexible notes for any purpose",
      icon: FileText,
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleNext = () => {
    // If no categories selected, default to all categories
    const categoriesToSave = selectedCategories.length > 0 
      ? selectedCategories 
      : categories.map(c => c.id);
    
    onNext(categoriesToSave);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Choose Your Note Categories</CardTitle>
        <p className="text-center text-muted-foreground">
          Select the types of notes you&apos;ll be creating most often
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "hover:bg-muted"
                )}
                onClick={() => toggleCategory(category.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleCategory(category.id);
                  }
                }}
              >
                <div className={cn(
                  "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="size-5" />
                </div>
                <div className="grow">
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="shrink-0 text-primary">
                    <Check className="size-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <StepProgress steps={steps} currentStep={currentStep} />
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continue
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 