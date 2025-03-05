'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Task {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date | null;
  priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  noteId: string | null;
  userId: string;
  completedAt: Date | null;
}

interface TaskItemProps {
  task: Task;
  onUpdate?: (updates: Partial<Task>) => void;
  onDelete?: () => void;
  className?: string;
}

export function TaskItem({ task, onUpdate, onDelete, className }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const handleToggleComplete = () => {
    onUpdate?.({ 
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date() : null
    });
  };

  const handleSaveEdit = () => {
    if (editContent.trim() === "") return;
    onUpdate?.({ content: editContent });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditContent(task.content);
    }
  };

  const handleChangePriority = (priority: 1 | 2 | 3) => {
    onUpdate?.({ priority });
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 1: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 3: return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 1: return "Low";
      case 2: return "Medium";
      case 3: return "High";
      default: return "None";
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-2 p-3 rounded-md border border-border group hover:bg-accent/20 transition-colors",
        task.isCompleted && "bg-accent/10",
        className
      )}
    >
      <Checkbox 
        checked={task.isCompleted} 
        onCheckedChange={handleToggleComplete}
        className="mt-1"
      />
      
      <div className="flex-1">
        {isEditing ? (
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            className="min-h-8 py-0 px-2"
          />
        ) : (
          <div 
            className={cn(
              "text-sm",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.content}
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Calendar className="size-3" />
            <span>Due: {format(task.dueDate, "PPP")}</span>
          </div>
        )}
      </div>
      
      <Badge variant="outline" className={cn("text-xs", getPriorityColor())}>
        {getPriorityLabel()}
      </Badge>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-6 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangePriority(1)}>
            <span className="size-2 rounded-full bg-blue-500 mr-2" />
            Set Low Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangePriority(2)}>
            <span className="size-2 rounded-full bg-yellow-500 mr-2" />
            Set Medium Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangePriority(3)}>
            <span className="size-2 rounded-full bg-red-500 mr-2" />
            Set High Priority
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 