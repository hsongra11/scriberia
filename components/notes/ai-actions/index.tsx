'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Expand, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Note } from '@/lib/db/schema';

interface NoteAIActionsProps {
  note?: Note;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function NoteAIActions({ note, onUpdate, className }: NoteAIActionsProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  // Function to summarize the note content
  const handleSummarize = async () => {
    if (!note?.content || !onUpdate) return;

    try {
      setIsSummarizing(true);
      
      const response = await fetch('/api/notes/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: note.content,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to summarize note');
      }

      // Update the note content with the summary
      onUpdate(data.summary);
      toast.success('Note summarized successfully');
    } catch (error) {
      console.error('Error summarizing note:', error);
      toast.error('Failed to summarize note');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Function to expand the note content
  const handleExpand = async () => {
    if (!note?.content || !onUpdate) return;

    try {
      setIsExpanding(true);
      
      const response = await fetch('/api/notes/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: note.content,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to expand note');
      }

      // Update the note content with the expanded content
      onUpdate(data.expanded);
      toast.success('Note expanded successfully');
    } catch (error) {
      console.error('Error expanding note:', error);
      toast.error('Failed to expand note');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSummarize}
        disabled={isSummarizing || !note?.content}
        title="Summarize note content"
      >
        {isSummarizing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        Summarize
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExpand}
        disabled={isExpanding || !note?.content}
        title="Expand note with more details"
      >
        {isExpanding ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Expand className="h-4 w-4 mr-2" />
        )}
        Expand
      </Button>
    </div>
  );
} 