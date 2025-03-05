'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';
import { AudioRecorder } from '@/components/audio/audio-recorder';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import type { Note } from '@/lib/db/schema';

interface NoteAudioProps {
  note?: Note;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function NoteAudio({ note, onUpdate, className = '' }: NoteAudioProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle saving the audio recording to the note
  const handleSaveRecording = (audioBlob: Blob, audioUrl: string) => {
    if (!note?.content || !onUpdate) return;

    // Create a timestamp for the recording
    const timestamp = new Date().toISOString();
    const audioFileName = `recording-${timestamp}.wav`;

    // Create a markdown audio element
    const audioMarkdown = `\n\n🎙️ **Audio Recording** (${audioFileName})\n\n`;

    // Update the note content with the audio markdown
    onUpdate(note.content + audioMarkdown);

    // Close the dialog
    setIsOpen(false);

    // In a real application, you would upload the audio blob to a storage service
    // and save the URL in the note content instead of just adding a placeholder
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          title="Record audio"
        >
          <Mic className="size-4 mr-2" />
          Record
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Record Audio</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="size-6"
            >
              <X className="size-4" />
            </Button>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-4">
          <AudioRecorder onSave={handleSaveRecording} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
} 