'use client';

import { useState } from 'react';
import { NoteContainer } from '@/components/notes/note-container';
import type { Template, Note } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';

interface ToDoProps {
  note?: Note;
  template: Template;
  isEditing?: boolean;
  onUpdate?: (data: Partial<Note>) => void;
}

type TaskItem = {
  content: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
};

// Parse tasks from markdown content
function parseTasksFromContent(content: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  const lines = content.split('\n');
  
  let currentPriority: TaskItem['priority'] = 'medium';
  
  for (const line of lines) {
    if (line.includes('High Priority')) {
      currentPriority = 'high';
      continue;
    } else if (line.includes('Medium Priority')) {
      currentPriority = 'medium';
      continue;
    } else if (line.includes('Low Priority')) {
      currentPriority = 'low';
      continue;
    }
    
    // Parse task items (- [ ] or - [x])
    const taskMatch = line.match(/- \[([ x])\] (.*)/);
    if (taskMatch) {
      tasks.push({
        content: taskMatch[2].trim(),
        isCompleted: taskMatch[1] === 'x',
        priority: currentPriority
      });
    }
  }
  
  return tasks;
}

// Generate markdown content from tasks
function generateContentFromTasks(tasks: TaskItem[]): string {
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium');
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low');
  
  let content = '# To-Do List\n\n';
  
  if (highPriorityTasks.length > 0) {
    content += '## High Priority\n';
    highPriorityTasks.forEach(task => {
      content += `- [${task.isCompleted ? 'x' : ' '}] ${task.content}\n`;
    });
    content += '\n';
  }
  
  if (mediumPriorityTasks.length > 0) {
    content += '## Medium Priority\n';
    mediumPriorityTasks.forEach(task => {
      content += `- [${task.isCompleted ? 'x' : ' '}] ${task.content}\n`;
    });
    content += '\n';
  }
  
  if (lowPriorityTasks.length > 0) {
    content += '## Low Priority\n';
    lowPriorityTasks.forEach(task => {
      content += `- [${task.isCompleted ? 'x' : ' '}] ${task.content}\n`;
    });
  }
  
  return content;
}

export function ToDo({
  note,
  template,
  isEditing = false,
  onUpdate,
}: ToDoProps) {
  // Get initial content from note or template
  const initialContent = note?.content || template.content;
  
  // Parse initial tasks from content
  const [tasks, setTasks] = useState<TaskItem[]>(
    parseTasksFromContent(initialContent)
  );
  
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('medium');
  
  const handleTaskToggle = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].isCompleted = !updatedTasks[index].isCompleted;
    setTasks(updatedTasks);
    
    if (onUpdate) {
      onUpdate({ content: generateContentFromTasks(updatedTasks) });
    }
  };
  
  const handleAddTask = () => {
    if (!newTaskContent.trim()) return;
    
    const newTask: TaskItem = {
      content: newTaskContent,
      isCompleted: false,
      priority: newTaskPriority,
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskContent('');
    
    if (onUpdate) {
      onUpdate({ content: generateContentFromTasks(updatedTasks) });
    }
  };
  
  const handleDeleteTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    
    if (onUpdate) {
      onUpdate({ content: generateContentFromTasks(updatedTasks) });
    }
  };
  
  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low');
  
  const renderTaskGroup = (groupTasks: TaskItem[], title: string) => {
    if (groupTasks.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="font-medium mb-2">{title}</h3>
        <ul className="space-y-2">
          {groupTasks.map((task, idx) => {
            const taskIndex = tasks.indexOf(task);
            return (
              <li key={`${title}-${idx}-${task.content.substring(0, 10)}`} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTaskToggle(taskIndex)}
                  className="text-primary"
                >
                  {task.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                <span className={task.isCompleted ? 'line-through text-muted-foreground' : ''}>
                  {task.content}
                </span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(taskIndex)}
                    className="ml-auto size-8"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  
  return (
    <NoteContainer note={note} isEditing={isEditing}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold tracking-tight">
            {note?.title || 'To-Do List'}
          </h1>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          {renderTaskGroup(highPriorityTasks, 'High Priority')}
          {renderTaskGroup(mediumPriorityTasks, 'Medium Priority')}
          {renderTaskGroup(lowPriorityTasks, 'Low Priority')}
          
          {isEditing && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  className="flex-1"
                />
                <select 
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                  className="border p-2 rounded-md bg-background"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Button onClick={handleAddTask} disabled={!newTaskContent.trim()}>
                  <Plus size={16} className="mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tasks yet. {isEditing ? 'Add some tasks to get started.' : ''}
            </div>
          )}
        </div>
        
        <div className="p-2 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {tasks.filter(t => t.isCompleted).length} of {tasks.length} tasks completed
          </div>
        </div>
      </div>
    </NoteContainer>
  );
} 