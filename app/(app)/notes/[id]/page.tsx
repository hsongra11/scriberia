'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

import { NoteContainer } from '@/components/notes/note-container';
import { NoteHeader } from '@/components/notes/note-header';
import { NoteContent } from '@/components/notes/note-content';
import { NoteActions } from '@/components/notes/note-actions';
import { Note } from '@/lib/db/schema';

// Define a type for our sample notes that matches the schema
type SampleNote = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date; // For UI purposes
  userId: string;
  templateId: string | null;
  category: 'brain-dump' | 'journal' | 'to-do' | 'mood-tracking' | 'custom';
  isArchived: boolean;
  isDeleted: boolean;
  lastEditedAt: Date;
};

// Sample note data (this would be fetched from the database)
const SAMPLE_NOTES: Record<string, SampleNote> = {
  '1': {
    id: '1',
    title: 'Meeting Notes',
    content: `# Meeting Notes
## Project Timeline

The project timeline has been updated:
- Phase 1: Research & Planning (2 weeks)
- Phase 2: Design & Development (4 weeks)
- Phase 3: Testing & QA (2 weeks)
- Phase 4: Launch & Marketing (2 weeks)

## Resource Allocation

John: Lead Designer
Sarah: Project Manager
Mike: Developer
Lisa: QA Tester

## Next Steps

1. Complete wireframes by Friday
2. Schedule kickoff meeting with client
3. Set up project management tools`,
    createdAt: new Date('2023-06-15T10:00:00'),
    updatedAt: new Date('2023-06-15T11:30:00'),
    lastEditedAt: new Date('2023-06-15T11:30:00'),
    userId: 'user1',
    templateId: 'notes',
    category: 'custom',
    isArchived: false,
    isDeleted: false
  },
  '2': {
    id: '2',
    title: 'Project Ideas',
    content: `# Project Ideas Brainstorm

## Mobile App Features
- Offline mode for saving notes
- Voice notes with transcription
- Dark mode / light mode toggle
- Cloud sync across devices
- Share notes with team members

## Website Improvements
- Redesign landing page
- Add testimonials section
- Improve loading times
- Add blog for updates`,
    createdAt: new Date('2023-06-10T14:00:00'),
    updatedAt: new Date('2023-06-14T09:15:00'),
    lastEditedAt: new Date('2023-06-14T09:15:00'),
    userId: 'user1',
    templateId: 'braindump',
    category: 'brain-dump',
    isArchived: false,
    isDeleted: false
  },
  '3': {
    id: '3',
    title: 'Weekly Todos',
    content: `# Weekly Todos

- Complete project proposal
- Review client feedback
- Update portfolio
- Schedule team meeting
- Submit expense reports
- Research new technologies
- Prepare presentation for next week`,
    createdAt: new Date('2023-06-12T08:30:00'),
    updatedAt: new Date('2023-06-12T08:30:00'),
    lastEditedAt: new Date('2023-06-12T08:30:00'),
    userId: 'user1',
    templateId: 'todo',
    category: 'to-do',
    isArchived: false,
    isDeleted: false
  }
};

interface NotePageProps {
  params: {
    id: string;
  };
}

export default function NotePage({ params }: NotePageProps) {
  const router = useRouter();
  const [note, setNote] = useState<SampleNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    // Fetch the note data
    const fetchedNote = SAMPLE_NOTES[params.id];
    if (fetchedNote) {
      setNote(fetchedNote);
    } else {
      notFound();
    }
  }, [params.id]);

  if (!note) {
    return <div>Loading...</div>;
  }
  
  const handleContentChange = (content: string) => {
    setNote({
      ...note,
      content,
      updatedAt: new Date(),
      lastEditedAt: new Date()
    });
  };
  
  const handleTitleChange = (title: string) => {
    setNote({
      ...note,
      title,
      updatedAt: new Date(),
      lastEditedAt: new Date()
    });
  };
  
  const handleSave = () => {
    // Here you would save the note to your database
    setIsEditing(false);
    // Simulate saving
    console.log('Saving note:', note);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <NoteContainer note={note} isEditing={isEditing}>
        <div className="flex items-center justify-between">
          <NoteHeader 
            note={note}
            title={note.title}
            onTitleChange={handleTitleChange}
            isEditing={isEditing}
            onSave={handleSave}
            onEdit={handleEdit}
            createdAt={note.createdAt}
            updatedAt={note.updatedAt}
          />
          <NoteActions 
            note={note}
            onUpdate={handleContentChange}
          />
        </div>
        <NoteContent 
          note={note}
          content={note.content}
          onContentChange={handleContentChange}
          isEditing={isEditing}
        />
      </NoteContainer>
    </div>
  );
} 