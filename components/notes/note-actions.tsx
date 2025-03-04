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

interface NoteActionsProps {
  note?: Note;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  className?: string;
}

export function NoteActions({
  note,
  onDelete,
  onDuplicate,
  onShare,
  onExport,
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
    <div className={cn("flex items-center p-3", className)}>
      <Separator className="mr-3" orientation="vertical" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDuplicate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="8" y="8" width="12" height="12" rx="2"></rect>
              <path d="M4 16V4a2 2 0 0 1 2-2h10"></path>
            </svg>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete} 
            className="text-destructive focus:text-destructive"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 