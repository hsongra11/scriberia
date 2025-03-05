import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '../../(auth)/auth';
import { NotesList } from '@/components/notes/notes-list';
import { NoteFilter } from '@/components/notes/note-filter';
import { NoteSearch } from '@/components/notes/note-search';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notes | HyperScribe',
  description: 'Manage your notes and recordings',
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Manage your notes and recordings
          </p>
        </div>
        <Button className="gap-1 sm:self-end" asChild>
          <a href="/notes/new">
            <Plus className="h-4 w-4" /> New Note
          </a>
        </Button>
      </div>
      
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <NoteSearch className="w-full sm:max-w-xs" />
        <NoteFilter className="w-full sm:max-w-[200px]" />
      </div>
      
      <NotesList />
    </div>
  );
} 