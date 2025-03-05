'use client';

import React from 'react';
import { NoteContainer } from '@/components/notes/note-container';
import type { Template, Note } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';

interface JournalProps {
  note?: Note;
  template: Template;
  isEditing?: boolean;
  onUpdate?: (data: Partial<Note>) => void;
}

export function Journal({
  note,
  template,
  isEditing = false,
  onUpdate,
}: JournalProps) {
  const moodOptions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😌', label: 'Peaceful' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
  ];
  
  const handleMoodSelect = (mood: string) => {
    if (!isEditing || !onUpdate || !note?.content) return;
    
    // Add mood to the "How I Feel Today" section
    const contentLines = note.content.split('\n');
    const moodLineIndex = contentLines.findIndex(line => line.trim().startsWith('Mood:'));
    
    if (moodLineIndex >= 0) {
      contentLines[moodLineIndex] = `Mood: ${mood}`;
      onUpdate({ content: contentLines.join('\n') });
    }
  };
  
  return (
    <NoteContainer note={note} isEditing={isEditing}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight">
            {note?.title || 'Journal Entry'}
          </h1>
        </div>
        
        {isEditing && (
          <div className="px-4 py-2 bg-muted/30 border-b flex items-center">
            <span className="text-sm text-muted-foreground mr-3">Today&apos;s Mood:</span>
            <div className="flex space-x-1">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.label}
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 rounded-full"
                  onClick={() => handleMoodSelect(mood.label)}
                  title={mood.label}
                >
                  <span className="text-lg">{mood.emoji}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-auto">
          {isEditing ? (
            <textarea
              className="size-full min-h-[300px] bg-transparent resize-none focus:outline-none"
              value={note?.content || template.content}
              onChange={(e) => onUpdate?.({ content: e.target.value })}
              placeholder="Start writing your journal entry..."
            />
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              {note?.content || template.content}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t flex justify-end space-x-2">
          {note?.id && (
            <>
              <Button variant="outline" size="sm">
                Share
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </>
          )}
        </div>
      </div>
    </NoteContainer>
  );
} 