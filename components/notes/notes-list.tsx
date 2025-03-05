'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  FileText,
  FileAudio,
  Trash,
  Pencil,
  Share,
  Mic
} from 'lucide-react';

interface NoteWithAttachments extends Note {
  attachments?: Array<{
    id: string;
    type: 'audio' | 'image' | 'file';
    url: string;
  }>;
}

interface NotesListProps {
  className?: string;
}

export function NotesList({ className }: NotesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<NoteWithAttachments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentPage = Number(searchParams.get('page') || '1');
  const pageSize = 12;
  const filter = searchParams.get('filter') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    async function fetchNotes() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
        });

        if (filter) {
          queryParams.append('filter', filter);
        }

        if (search) {
          queryParams.append('search', search);
        }

        const response = await fetch(`/api/notes?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        const data = await response.json();
        setNotes(data.notes);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotes();
  }, [currentPage, filter, search]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/notes?${params.toString()}`);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      // Update local state
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const hasAudioAttachment = (note: NoteWithAttachments) => {
    return note.attachments?.some(attachment => attachment.type === 'audio');
  };

  return (
    <div className={className}>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Card key={`loading-note-card-${i}`} className="h-64 animate-pulse">
              <CardHeader className="h-1/2 bg-muted" />
              <CardContent className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded-md bg-muted" />
                <div className="h-3 w-1/2 rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="group overflow-hidden">
                <Link href={`/notes/${note.id}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-2 text-lg">
                      {note.title || 'Untitled Note'}
                      {hasAudioAttachment(note) && (
                        <span className="ml-2 inline-flex items-center">
                          <FileAudio className="size-4 text-blue-500" />
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="line-clamp-3 text-sm text-muted-foreground">
                      {note.content ? (
                        note.content.replace(/<[^>]*>/g, '')
                      ) : (
                        <span className="text-muted-foreground">No content</span>
                      )}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="flex items-center justify-between border-t bg-muted/40 p-2">
                  <div className="text-xs text-muted-foreground">
                    {note.lastEditedAt ? (
                      `Edited ${formatDistanceToNow(new Date(note.lastEditedAt), { addSuffix: true })}`
                    ) : (
                      `Created ${formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}`
                    )}
                  </div>
                  <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/notes/${note.id}?edit=true`);
                      }}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    {hasAudioAttachment(note) ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/notes/${note.id}?record=true`);
                        }}
                      >
                        <Mic className="size-4" />
                        <span className="sr-only">Record</span>
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Open share modal
                        router.push(`/notes/${note.id}?share=true`);
                      }}
                    >
                      <Share className="size-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this note?')) {
                          handleDeleteNote(note.id);
                        }
                      }}
                    >
                      <Trash className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
            <FileText className="size-6" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No notes found</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            {filter 
              ? `No ${filter} notes found. Try a different filter or create a new note.`
              : search
              ? `No notes matching "${search}". Try a different search term.`
              : "You don't have any notes yet. Create your first note to get started!"}
          </p>
          <Button onClick={() => router.push('/notes/new')}>
            Create Note
          </Button>
        </div>
      )}
    </div>
  );
} 