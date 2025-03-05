'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from 'ai/react';
import { Loader2, ListTodo, Wand2 } from 'lucide-react';
import { Task } from './task-item';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TaskItem } from './task-item';

interface TaskGeneratorProps {
  noteId?: string;
  onAddTasks?: (tasks: Partial<Task>[]) => void;
  className?: string;
}

export function TaskGenerator({ noteId, onAddTasks, className }: TaskGeneratorProps) {
  const [content, setContent] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<Partial<Task>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTasks = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          noteId,
          maxTasks: 10, // Adjust as needed
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tasks');
      }
      
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        setExtractedTasks(data.tasks.map((task: any) => ({
          ...task,
          // Ensure the task has the necessary structure
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        })));
      } else {
        setExtractedTasks([]);
      }
    } catch (err) {
      console.error('Error generating tasks:', err);
      setError((err as Error).message || 'Failed to generate tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToTasks = () => {
    if (extractedTasks.length > 0 && onAddTasks) {
      onAddTasks(extractedTasks);
      setExtractedTasks([]);
      setContent('');
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generate Tasks
        </CardTitle>
        <CardDescription>
          Paste text from your notes or enter a description to automatically extract tasks
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter text to extract tasks from..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-32 resize-y"
        />
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        
        {extractedTasks.length > 0 && (
          <div className="space-y-2 border rounded-md p-3">
            <div className="text-sm font-medium flex items-center gap-2 mb-2">
              <ListTodo className="h-4 w-4" />
              Extracted Tasks ({extractedTasks.length})
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {extractedTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 p-2 border rounded-md"
                >
                  <div className="w-full">
                    <div className="text-sm">{task.content}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                        task.priority === 1 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                        task.priority === 2 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {task.priority === 1 ? "Low" : task.priority === 2 ? "Medium" : "High"}
                      </span>
                      
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {task.dueDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setContent('');
            setExtractedTasks([]);
          }}
          disabled={isGenerating || (!content && extractedTasks.length === 0)}
        >
          Clear
        </Button>
        <div className="flex gap-2">
          {extractedTasks.length > 0 ? (
            <Button onClick={handleAddToTasks} disabled={isGenerating}>
              Add to Tasks
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateTasks} 
              disabled={isGenerating || !content.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate Tasks</>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 