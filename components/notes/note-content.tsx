'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Note } from '@/lib/db/schema';

interface NoteContentProps {
  note?: Note;
  content: string;
  onContentChange?: (content: string) => void;
  isEditing?: boolean;
  className?: string;
  placeholder?: string;
}

export function NoteContent({
  note,
  content,
  onContentChange,
  isEditing = false,
  className,
  placeholder = "Start typing your note here...",
}: NoteContentProps) {
  const [localContent, setLocalContent] = useState(content);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onContentChange?.(e.target.value);
  };

  // Function to process the content with Markdown-like formatting
  const processContent = (text: string) => {
    // This is a simple implementation that could be expanded with a proper Markdown parser
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mb-2">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mb-2">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold mb-2">{line.slice(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return <li key={i} className="ml-6 mb-1 list-disc">{line.slice(2)}</li>;
        } else if (line === '') {
          return <br key={i} />;
        } else {
          return <p key={i} className="mb-2">{line}</p>;
        }
      });
  };

  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      {isEditing ? (
        <Textarea
          value={localContent}
          onChange={handleContentChange}
          placeholder={placeholder}
          className="w-full h-full p-4 resize-none border-0 focus-visible:ring-0 bg-background"
        />
      ) : (
        <div className="h-full overflow-auto">
          <div className="p-4 whitespace-pre-wrap">
            {content ? (
              <div className="prose dark:prose-invert prose-sm max-w-none">
                {processContent(content)}
              </div>
            ) : (
              <div className="text-muted-foreground italic">{placeholder}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 