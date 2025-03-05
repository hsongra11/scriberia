import { useState, useEffect } from "react";
import { TaskItem, type Task } from "./task-item";
import { cn } from "@/lib/utils";
import { TaskCreator } from "./task-creator";

interface TaskListProps {
  tasks: Task[];
  noteId?: string;
  onCreateTask?: (task: {
    content: string;
    dueDate: Date | null;
    priority: 1 | 2 | 3;
  }) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDeleteTask?: (id: string) => void;
  showCompleted?: boolean;
  className?: string;
}

export function TaskList({
  tasks,
  noteId,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  showCompleted = true,
  className,
}: TaskListProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  // Filter tasks based on showCompleted prop
  useEffect(() => {
    const filtered = showCompleted 
      ? tasks 
      : tasks.filter(task => !task.isCompleted);
      
    // Sort by priority (high to low) and then by due date
    const sorted = [...filtered].sort((a, b) => {
      // Priority first (higher number = higher priority)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      
      // Then by due date (closest first)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      
      // Tasks with due dates come before tasks without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Finally sort by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    setFilteredTasks(sorted);
  }, [tasks, showCompleted]);

  return (
    <div className={cn("space-y-4", className)}>
      <TaskCreator 
        noteId={noteId} 
        onCreateTask={onCreateTask} 
      />
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No tasks to display
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={(updates) => onUpdateTask?.(task.id, updates)}
              onDelete={() => onDeleteTask?.(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 