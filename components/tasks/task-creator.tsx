'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCreatorProps {
  noteId?: string;
  onCreateTask?: (task: {
    content: string;
    dueDate: Date | null;
    priority: 1 | 2 | 3;
  }) => void;
  className?: string;
}

export function TaskCreator({ noteId, onCreateTask, className = '' }: TaskCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<1 | 2 | 3>(2);

  const handleCreateTask = () => {
    if (content.trim() === "") return;
    
    if (onCreateTask) {
      onCreateTask({
        content,
        dueDate,
        priority
      });
    }
    
    // Reset form
    setContent("");
    setDueDate(null);
    setPriority(2);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && content.trim() !== "") {
      handleCreateTask();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <CalendarIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate || undefined}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={priority === 1 ? "default" : "outline"}
            onClick={() => setPriority(1)}
          >
            Low
          </Button>
          <Button 
            size="sm" 
            variant={priority === 2 ? "default" : "outline"}
            onClick={() => setPriority(2)}
          >
            Medium
          </Button>
          <Button 
            size="sm" 
            variant={priority === 3 ? "default" : "outline"}
            onClick={() => setPriority(3)}
          >
            High
          </Button>
        </div>
        
        <Button onClick={handleCreateTask}>
          Create Task
        </Button>
      </div>
      
      {dueDate && (
        <div className="text-sm text-muted-foreground">
          Due: {format(dueDate, "PPP")}
        </div>
      )}
    </div>
  );
} 