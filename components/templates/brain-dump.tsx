'use client';

import React from 'react';
import { NoteContainer } from '@/components/notes/note-container';
import { NoteHeader } from '@/components/notes/note-header';
import { NoteContent } from '@/components/notes/note-content';
import { NoteActions } from '@/components/notes/note-actions';
import { Template, Note } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BrainDumpProps {
  note?: Note;
  template: Template;
  isEditing?: boolean;
  onUpdate?: (data: Partial<Note>) => void;
  onAddSection?: (sectionTitle: string) => void;
}

export function BrainDump({
  note,
  template,
  isEditing = false,
  onUpdate,
  onAddSection,
}: BrainDumpProps) {
  const handleAddSection = (section: string) => {
    if (!onAddSection) return;
    
    onAddSection(section);
  };
  
  const sections = [
    { label: 'Thoughts', icon: '💭' },
    { label: 'Ideas', icon: '💡' },
    { label: 'Questions', icon: '❓' },
    { label: 'Random Musings', icon: '🤔' },
  ];
  
  return (
    <NoteContainer note={note} isEditing={isEditing}>
      <NoteHeader
        title={note?.title || 'Brain Dump'}
        isEditing={isEditing}
        onUpdate={(title) => onUpdate?.({ title })}
      />
      
      <div className="px-4 py-2 bg-muted/50 border-y flex items-center overflow-x-auto no-scrollbar">
        {sections.map((section) => (
          <Button
            key={section.label}
            variant="ghost"
            size="sm"
            className="text-sm whitespace-nowrap"
            onClick={() => handleAddSection(section.label)}
          >
            <span className="mr-1">{section.icon}</span>
            <span>{section.label}</span>
            <Plus className="w-3 h-3 ml-1" />
          </Button>
        ))}
      </div>
      
      <NoteContent
        content={note?.content || template.content}
        isEditing={isEditing}
        onUpdate={(content) => onUpdate?.({ content })}
        className="flex-1 overflow-auto"
      />
      
      <NoteActions
        isEditing={isEditing}
        noteId={note?.id}
        className="border-t"
      />
    </NoteContainer>
  );
} 