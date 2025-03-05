import React from "react";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export interface TaskListProps {
  tasks: Task[];
  noteId: string;
  showCompleted: boolean;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, data: Partial<Task>) => void;
  onEdit?: (taskId: string) => void;
}

export function TaskList({
  tasks,
  noteId,
  showCompleted,
  onDelete,
  onUpdate,
  onEdit,
}: TaskListProps) {
  // Filter tasks based on completion status
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.isCompleted);

  // If there are no tasks to show after filtering
  if (filteredTasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic py-2">
        {tasks.length === 0
          ? "No tasks created yet"
          : "No tasks to show. All tasks are completed."}
      </div>
    );
  }

  return (
    <div className="space-y-2 my-2">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 group py-1 px-2 rounded hover:bg-secondary/40"
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.isCompleted}
            onCheckedChange={(checked) => {
              if (onUpdate) {
                onUpdate(task.id, { isCompleted: checked as boolean });
              }
            }}
            className={cn(
              "rounded-full",
              task.isCompleted
                ? "opacity-50 line-through"
                : "opacity-100"
            )}
          />
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "flex-1 cursor-pointer text-sm",
              task.isCompleted
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {task.content}
          </label>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Task actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
} 