'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ListTodo, 
  Mic, 
  MoreHorizontal, 
  FileAudio, 
  FileCheck
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  className?: string;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export function QuickActions({ className }: QuickActionsProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'new-note',
      name: 'Create Note',
      description: 'Start a new text note',
      icon: <FileText className="size-5" />,
      action: () => {
        setIsCreating(true);
        fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'Untitled Note' }),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to create note');
            return response.json();
          })
          .then((data) => {
            router.push(`/notes/${data.note.id}`);
          })
          .catch((error) => {
            console.error('Error creating note:', error);
            setIsCreating(false);
          });
      },
    },
    {
      id: 'new-audio',
      name: 'Audio Note',
      description: 'Record an audio note',
      icon: <Mic className="size-5" />,
      action: () => {
        setIsCreating(true);
        fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'Audio Note' }),
        })
          .then((response) => {
            if (!response.ok) throw new Error('Failed to create note');
            return response.json();
          })
          .then((data) => {
            router.push(`/notes/${data.note.id}?record=true`);
          })
          .catch((error) => {
            console.error('Error creating note:', error);
            setIsCreating(false);
          });
      },
    },
    {
      id: 'new-task',
      name: 'Add Task',
      description: 'Create a new task',
      icon: <ListTodo className="size-5" />,
      action: () => {
        router.push('/tasks/new');
      },
    },
    {
      id: 'my-recordings',
      name: 'My Recordings',
      description: 'View all audio notes',
      icon: <FileAudio className="size-5" />,
      action: () => {
        router.push('/notes?filter=audio');
      },
    },
    {
      id: 'completed-tasks',
      name: 'Completed Tasks',
      description: 'View your achievements',
      icon: <FileCheck className="size-5" />,
      action: () => {
        router.push('/tasks?filter=completed');
      },
    },
    {
      id: 'more',
      name: 'More Options',
      description: 'View all actions',
      icon: <MoreHorizontal className="size-5" />,
      action: () => {
        router.push('/settings');
      },
    },
  ];

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="flex h-24 flex-col items-center justify-center gap-1 p-2"
              disabled={isCreating}
              onClick={action.action}
            >
              <div className="rounded-full bg-primary/10 p-2 text-primary dark:bg-primary/20">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 