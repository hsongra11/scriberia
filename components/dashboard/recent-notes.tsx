'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentNotesProps {
  className?: string;
  limit?: number;
}

export function RecentNotes({ className, limit = 5 }: RecentNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentNotes() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/notes/recent?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recent notes');
        }
        const data = await response.json();
        setNotes(data.notes);
      } catch (error) {
        console.error('Error fetching recent notes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentNotes();
  }, [limit]);

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Notes</CardTitle>
        <Link href="/notes">
          <Button variant="ghost" size="sm" className="ml-auto gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div 
                key={i} 
                className="h-16 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note) => (
              <Link 
                key={note.id} 
                href={`/notes/${note.id}`}
                className="block"
              >
                <div className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-muted">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{note.title || 'Untitled Note'}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {note.lastEditedAt && note.lastEditedAt > note.createdAt ? (
                        <span>Updated {formatDistanceToNow(new Date(note.lastEditedAt), { addSuffix: true })}</span>
                      ) : (
                        <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">You haven't created any notes yet</p>
            <Link href="/notes/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Create Note
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 