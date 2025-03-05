'use client';

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Note, Task } from "@/lib/db/schema";
import { TaskList } from "@/components/notes/task-list";
import { TaskCreator } from "@/components/notes/task-creator";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

interface NoteContentProps {
  note?: Note;
  content: string;
  onContentChange: (content: string) => void;
  isEditing: boolean;
  tasks?: Task[];
  onCreateTask?: (task: Partial<Task>) => void;
  onUpdateTask?: (taskId: string, data: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
}

export function NoteContent({
  note,
  content,
  onContentChange,
  isEditing,
  tasks = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
}: NoteContentProps) {
  const [showTasks, setShowTasks] = useState(false);

  const formatContent = (text: string) => {
    // Convert newlines to <br>
    let formatted = text.replace(/\n/g, "<br>");

    // Basic Markdown-like formatting
    // Headers
    formatted = formatted.replace(/# (.*?)(<br>|$)/g, "<h1>$1</h1>");
    formatted = formatted.replace(/## (.*?)(<br>|$)/g, "<h2>$1</h2>");
    formatted = formatted.replace(/### (.*?)(<br>|$)/g, "<h3>$1</h3>");

    // Bold
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Lists
    formatted = formatted.replace(/- (.*?)(<br>|$)/g, "<li>$1</li>");

    return formatted;
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[200px] resize-vertical"
            placeholder="Start writing your note..."
          />
          
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
              className="mb-2"
            >
              <ListChecks className="mr-2 h-4 w-4" />
              {showTasks ? "Hide Tasks" : "Show Tasks"}
            </Button>
            
            {showTasks && note?.id && (
              <div className="border rounded-md p-3 mt-2">
                <h3 className="text-sm font-medium mb-2">Tasks</h3>
                
                <TaskList 
                  tasks={tasks}
                  noteId={note.id} 
                  showCompleted={false}
                  onDelete={onDeleteTask}
                  onUpdate={onUpdateTask}
                  onEdit={onEditTask}
                />
                
                {onCreateTask && (
                  <TaskCreator 
                    noteId={note.id} 
                    onCreateTask={onCreateTask} 
                  />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div 
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
          
          {note?.id && tasks.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTasks(!showTasks)}
                className="mb-2"
              >
                <ListChecks className="mr-2 h-4 w-4" />
                {showTasks ? "Hide Tasks" : `Show Tasks (${tasks.length})`}
              </Button>
              
              {showTasks && (
                <div className="border rounded-md p-3 mt-2">
                  <h3 className="text-sm font-medium mb-2">Tasks</h3>
                  
                  <TaskList 
                    tasks={tasks}
                    noteId={note.id} 
                    showCompleted={true}
                    onUpdate={onUpdateTask}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 