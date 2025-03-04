import { notFound } from 'next/navigation';

import { NoteContainer } from '@/components/notes/note-container';
import { NoteHeader } from '@/components/notes/note-header';
import { NoteContent } from '@/components/notes/note-content';
import { NoteActions } from '@/components/notes/note-actions';
import { auth } from '../../../(auth)/auth';

// Define a type for our sample notes
type SampleNote = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  templateId: string;
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
    userId: 'user1',
    templateId: 'notes'
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
    userId: 'user1',
    templateId: 'braindump'
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
    userId: 'user1',
    templateId: 'todo'
  }
};

interface NotePageProps {
  params: {
    id: string;
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const session = await auth();
  const user = session?.user;
  
  const note = SAMPLE_NOTES[params.id];
  
  if (!note) {
    notFound();
  }
  
  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <NoteContainer>
        <div className="flex items-center justify-between">
          <NoteHeader 
            title={note.title}
            createdAt={note.createdAt}
            updatedAt={note.updatedAt}
          />
          <NoteActions />
        </div>
        <NoteContent 
          content={note.content}
        />
      </NoteContainer>
    </div>
  );
} 