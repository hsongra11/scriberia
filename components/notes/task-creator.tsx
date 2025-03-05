import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/lib/db/schema";

interface TaskCreatorProps {
  noteId: string;
  onCreateTask: (task: Partial<Task>) => void;
}

export function TaskCreator({ noteId, onCreateTask }: TaskCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [taskContent, setTaskContent] = useState("");

  const handleAddTask = () => {
    // Only create task if content is not empty
    if (taskContent.trim()) {
      onCreateTask({
        content: taskContent,
        noteId,
        isCompleted: false,
      });
      setTaskContent("");
      // Keep the creator open for multiple additions
    } else {
      // If empty, just cancel
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setTaskContent("");
    }
  };

  if (!isCreating) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full text-muted-foreground"
        onClick={() => setIsCreating(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-2">
      <Input
        value={taskContent}
        onChange={(e) => setTaskContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task..."
        autoFocus
        className="flex-1 text-sm"
      />
      <Button
        size="sm"
        onClick={handleAddTask}
        disabled={!taskContent.trim()}
      >
        Add
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setIsCreating(false);
          setTaskContent("");
        }}
      >
        Cancel
      </Button>
    </div>
  );
} 