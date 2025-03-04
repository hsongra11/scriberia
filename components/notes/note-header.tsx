'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NoteHeaderProps {
  note?: Note;
  title: string;
  onTitleChange?: (title: string) => void;
  isEditing?: boolean;
  onSave?: () => void;
  onEdit?: () => void;
  onBack?: () => void;
  className?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function NoteHeader({
  note,
  title,
  onTitleChange,
  isEditing = false,
  onSave,
  onEdit,
  onBack,
  className,
  createdAt,
  updatedAt,
}: NoteHeaderProps) {
  const router = useRouter();
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
    onTitleChange?.(e.target.value);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("px-4 py-3 flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="h-8 w-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="sr-only">Back</span>
          </Button>
          
          {isEditing ? (
            <Input
              value={localTitle}
              onChange={handleTitleChange}
              className="h-8 font-medium text-lg w-[300px] bg-background"
              placeholder="Note title"
            />
          ) : (
            <h1 className="font-medium text-lg truncate">{title}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onSave}
              className="h-8"
            >
              Save
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="h-8"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {(createdAt || updatedAt) && (
        <div className="flex items-center text-xs text-muted-foreground">
          {createdAt && <span>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</span>}
          {createdAt && updatedAt && <span className="mx-1">•</span>}
          {updatedAt && <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>}
        </div>
      )}
      
      <Separator />
    </div>
  );
} 