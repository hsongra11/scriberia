'use client';

import React from 'react';
import { NoteContainer } from '@/components/notes/note-container';
import type { Template, Note } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';

interface MoodTrackingProps {
  note?: Note;
  template: Template;
  isEditing?: boolean;
  onUpdate?: (data: Partial<Note>) => void;
}

const MOOD_EMOJIS = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😞', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export function MoodTracking({
  note,
  template,
  isEditing = false,
  onUpdate,
}: MoodTrackingProps) {
  const handleInsertMood = (mood: typeof MOOD_EMOJIS[0]) => {
    if (!isEditing || !onUpdate || !note?.content) return;
    
    // Insert the mood at the cursor position or at the end of the content
    const newContent = `${note.content}\n\nMood: ${mood.emoji} ${mood.label} (${mood.value}/5)`;
    onUpdate({ content: newContent });
  };
  
  return (
    <NoteContainer note={note} isEditing={isEditing}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight">
            {note?.title || 'Mood Tracker'}
          </h1>
        </div>
        
        {isEditing && (
          <div className="p-4 border-b bg-muted/20">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground mb-2">
                Add mood entry:
              </p>
              <div className="flex justify-between">
                {MOOD_EMOJIS.map(mood => (
                  <Button
                    key={mood.value}
                    variant="outline"
                    className="flex flex-col items-center h-auto py-2 gap-1"
                    onClick={() => handleInsertMood(mood)}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-auto">
          {isEditing ? (
            <textarea
              className="size-full min-h-[300px] bg-transparent resize-none focus:outline-none"
              value={note?.content || template.content}
              onChange={(e) => onUpdate?.({ content: e.target.value })}
              placeholder="Start tracking your mood..."
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {note?.content || template.content}
            </div>
          )}
        </div>
      </div>
    </NoteContainer>
  );
} 