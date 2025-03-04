import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { auth } from '../../(auth)/auth';
import { Separator } from '@/components/ui/separator';

// Sample notes data (would be replaced by actual database queries)
const SAMPLE_NOTES = [
  {
    id: '1',
    title: 'Meeting Notes',
    excerpt: 'Discussion about the new project timeline and resource allocation.',
    createdAt: new Date('2023-06-15T10:00:00'),
    updatedAt: new Date('2023-06-15T11:30:00'),
    templateId: 'notes'
  },
  {
    id: '2',
    title: 'Project Ideas',
    excerpt: 'Brainstorming session for upcoming product features.',
    createdAt: new Date('2023-06-10T14:00:00'),
    updatedAt: new Date('2023-06-14T09:15:00'),
    templateId: 'braindump'
  },
  {
    id: '3',
    title: 'Weekly Todos',
    excerpt: 'Tasks to complete by the end of the week.',
    createdAt: new Date('2023-06-12T08:30:00'),
    updatedAt: new Date('2023-06-12T08:30:00'),
    templateId: 'todo'
  }
];

export default async function NotesPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col flex-1 w-full h-full p-4 md:p-8 overflow-auto">
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              View and manage all your notes
            </p>
          </div>
          
          <Button asChild>
            <Link href="/notes/new">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Note
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Notes</h2>
            <div className="flex items-center gap-2">
              {/* These would be real filter/sort controls in the full implementation */}
              <Button variant="outline" size="sm">
                Recent
              </Button>
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span className="ml-2">Filter</span>
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_NOTES.map((note) => (
            <Link 
              key={note.id} 
              href={`/notes/${note.id}`}
              className="group border rounded-lg p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg group-hover:text-primary truncate">
                    {note.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground p-1 rounded-md bg-secondary">
                    {note.templateId === 'notes' && 'Note'}
                    {note.templateId === 'braindump' && 'Brain Dump'}
                    {note.templateId === 'todo' && 'Todo'}
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {note.excerpt}
                </p>
                
                <div className="mt-auto pt-2 flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    Created: {note.createdAt.toLocaleDateString()}
                  </span>
                  {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() && (
                    <span>
                      Updated: {note.updatedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 