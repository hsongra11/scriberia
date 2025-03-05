import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function NoteEditPageSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
} 