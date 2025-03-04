'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/db/schema';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { NoteAIActions } from './ai-actions';
import { NoteAudio } from './note-audio';

interface NoteActionsProps {
  note?: Note;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function NoteActions({
  note,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
  onUpdate,
  className,
}: NoteActionsProps) {
  const router = useRouter();

  const handleDelete = () => {
    if (!note) return;
    
    if (onDelete) {
      onDelete();
    } else {
      // Default delete behavior
      toast.promise(
        new Promise((resolve) => {
          // Simulating delete API call
          setTimeout(resolve, 1000);
        }),
        {
          loading: 'Deleting note...',
          success: () => {
            router.push('/notes');
            return 'Note deleted successfully';
          },
          error: 'Failed to delete note',
        }
      );
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
    } else {
      toast.info('Duplicate feature coming soon');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toast.info('Share feature coming soon');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      toast.info('Export feature coming soon');
    }
  };

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {/* Audio Recording */}
      <NoteAudio note={note} onUpdate={onUpdate} />
      
      {/* AI Actions */}
      <NoteAIActions note={note} onUpdate={onUpdate} />
      
      {/* Separator */}
      <Separator orientation="vertical" className="h-6" />
      
      {/* Main Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 