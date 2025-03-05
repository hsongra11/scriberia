'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Task } from '@/lib/db/schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface DailyTasksProps {
  className?: string;
  limit?: number;
}

export function DailyTasks({ className, limit = 5 }: DailyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyTasks() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tasks/daily?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch daily tasks');
        }
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Error fetching daily tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyTasks();
  }, [limit]);

  const handleTaskComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 3:
        return 'text-red-500';
      case 2:
        return 'text-amber-500';
      case 1:
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today's Tasks</CardTitle>
        <Link href="/tasks">
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
                className="h-12 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-muted',
                  task.isCompleted && 'opacity-60'
                )}
              >
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={(checked) => {
                    handleTaskComplete(task.id, checked === true);
                  }}
                />
                <div className="flex-1">
                  <p className={cn(
                    'font-medium',
                    task.isCompleted && 'line-through text-muted-foreground'
                  )}>
                    {task.content}
                  </p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <div className={cn('text-sm font-medium', getPriorityColor(task.priority))}>
                  {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : task.priority === 1 ? 'Low' : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="mb-2 text-muted-foreground">All tasks complete for today!</p>
            <Link href="/tasks/new">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add New Task
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 