'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Note } from '@/lib/db/schema';

interface NoteContainerProps {
  children: React.ReactNode;
  className?: string;
  note?: Note;
  isEditing?: boolean;
}

export function NoteContainer({
  children,
  className,
  note,
  isEditing = false,
}: NoteContainerProps) {
  return (
    <div 
      className={cn(
        "flex flex-col w-full h-full overflow-hidden border rounded-lg bg-card shadow-sm",
        isEditing ? "border-primary/50" : "border-border",
        className
      )}
    >
      {children}
    </div>
  );
} 