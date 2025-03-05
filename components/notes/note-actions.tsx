'use client';

import React, { useState } from 'react';
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
import { AudioTranscription } from '@/components/audio/audio-transcription';
import { MoreVertical, Trash, Share2 } from 'lucide-react';
import { ShareModal } from '@/components/notes/share-modal';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!note?.id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      
      if (onDelete) {
        onDelete();
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setIsDeleting(false);
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

  // Handle saving the transcription
  const handleSaveTranscription = (transcription: string) => {
    if (!note?.content || !onUpdate) return;

    // Add transcription to note content
    const timestamp = new Date().toISOString();
    const transcriptionText = `\n\n🎙️ **Transcription** (${timestamp}):\n\n${transcription}\n\n`;
    
    // Update the note content with the transcription
    onUpdate(note.content + transcriptionText);
    
    toast.success('Transcription added to note');
  };

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {/* Audio Recording */}
      <NoteAudio note={note} onUpdate={onUpdate} />
      
      {/* Audio Transcription */}
      <AudioTranscription onSave={handleSaveTranscription} />
      
      {/* AI Actions */}
      <NoteAIActions note={note} onUpdate={onUpdate} />
      
      {/* Separator */}
      <Separator orientation="vertical" className="h-6" />
      
      {/* Main Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">More options</span>
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
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Note'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 