import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { auth } from '../../(auth)/auth';
import { Separator } from '@/components/ui/separator';

// Sample templates data (would be replaced by actual database queries)
const SAMPLE_TEMPLATES = [
  {
    id: 'default',
    name: 'Blank Note',
    description: 'A simple blank note for general use.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    ),
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Template for taking notes during meetings with sections for agenda, decisions, and action items.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    ),
  },
  {
    id: 'braindump',
    name: 'Brain Dump',
    description: 'Quick capture of thoughts and ideas without structure.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
  },
  {
    id: 'todo',
    name: 'To-Do List',
    description: 'Structured template for creating and tracking tasks.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    description: 'Template for daily reflections, gratitude, and goals.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6v18h18"></path>
        <path d="M7 15 l4 -4 l-5 -6"></path>
        <path d="M18 9 l-6 6"></path>
        <path d="M9 3 h12 v6"></path>
      </svg>
    ),
  },
  {
    id: 'project-plan',
    name: 'Project Plan',
    description: 'Structured template for planning projects with goals, timelines, and resources.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 L13 10 L22 10"></path>
        <path d="M13 16 L13 22"></path>
        <path d="M21 16 L13 22 L5 16"></path>
        <path d="M13 2 L5 8 L5 16"></path>
      </svg>
    ),
  },
];

export default async function TemplatesPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col flex-1 w-full h-full p-4 md:p-8 overflow-auto">
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Choose a template to start a new note
            </p>
          </div>
          
          <Button asChild variant="outline">
            <Link href="/templates/new">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Template
            </Link>
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_TEMPLATES.map((template) => (
            <Link 
              key={template.id} 
              href={`/notes/new?template=${template.id}`}
              className="group flex flex-col gap-4 border rounded-lg p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {template.icon}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg group-hover:text-primary">
                  {template.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {template.description}
                </p>
              </div>
              
              <Button variant="ghost" className="mt-auto justify-start p-0 h-8 text-primary font-medium">
                Use Template
                <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}