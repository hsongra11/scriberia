"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Note, Template, Task } from "@/lib/db/schema";
import { createNote, updateNote } from "@/lib/notes/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NoteContent } from "@/components/notes/note-content";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, ArchiveIcon, Trash2, Share } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string(),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

interface NoteEditorProps {
  note?: Note | null;
  templates?: Template[];
  isNewNote: boolean;
}

export function NoteEditor({ note, templates = [], isNewNote }: NoteEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Create form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "Untitled Note",
      content: note?.content || "",
      category: (note?.category as any) || "custom",
    },
  });

  // Track if the form is dirty (has unsaved changes)
  const isDirty = form.formState.isDirty;
  
  // Setup auto-save with debounce
  const debouncedSave = useRef(
    debounce(async (data: z.infer<typeof formSchema>) => {
      if (note?.id) {
        await saveNote(data);
      }
    }, 2000)
  ).current;

  // Handle auto-save when form values change
  useEffect(() => {
    if (isDirty && !isNewNote && note?.id) {
      setIsSaving(true);
      debouncedSave(form.getValues());
    }
  }, [form.watch(), isDirty, isNewNote]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Save note function
  const saveNote = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isNewNote) {
        const result = await createNote(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.note) {
          toast.success("Note created successfully");
          router.push(`/notes/${result.note.id}`);
        }
      } else if (note?.id) {
        const result = await updateNote(note.id, data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.note) {
          toast.success("Note saved");
          // Update form defaults with new data
          form.reset(data);
        }
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await saveNote(data);
    });
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("title", template.name, { shouldDirty: true });
      form.setValue("content", template.content, { shouldDirty: true });
      form.setValue("category", template.category as any, { shouldDirty: true });
    }
  };

  // Handle task operations
  const handleCreateTask = (task: Partial<Task>) => {
    // Here you would call an API to create a task
    // For this example, we'll just update the local state
    const newTask: Task = {
      id: `temp-${Date.now()}`,
      content: task.content || "",
      isCompleted: task.isCompleted || false,
      noteId: note?.id || "",
      userId: note?.userId || "",
      createdAt: new Date(),
      dueDate: null,
      priority: null,
      completedAt: null
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, data: Partial<Task>) => {
    // Here you would call an API to update a task
    // For this example, we'll just update the local state
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, ...data } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    // Here you would call an API to delete a task
    // For this example, we'll just update the local state
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleEditTask = (taskId: string) => {
    // Handle task editing
    // For this example, we'll just log it
    console.log("Editing task:", taskId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col space-y-4">
          {/* Note title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                    placeholder="Untitled Note"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category and template selector row */}
          <div className="flex justify-between items-center mt-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="w-[180px]">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="brain-dump">Brain Dump</SelectItem>
                      <SelectItem value="journal">Journal</SelectItem>
                      <SelectItem value="to-do">To-Do</SelectItem>
                      <SelectItem value="mood-tracking">Mood Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template selector (only for new notes) */}
            {isNewNote && templates.length > 0 && (
              <div className="w-[240px]">
                <FormLabel>Apply Template</FormLabel>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Note content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NoteContent
                    note={note || undefined}
                    content={field.value}
                    onContentChange={field.onChange}
                    isEditing={true}
                    tasks={tasks}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isPending || (!isNewNote && !isDirty)}
              className={cn(
                "flex items-center",
                isSaving && "bg-amber-600 hover:bg-amber-700"
              )}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>

          <div className="flex space-x-2">
            {!isNewNote && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Here you would implement sharing functionality
                    console.log("Share note", note?.id);
                  }}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Here you would implement archive functionality
                    console.log("Archive note", note?.id);
                  }}
                >
                  <ArchiveIcon className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    // Here you would implement delete functionality
                    if (confirm("Are you sure you want to delete this note?")) {
                      console.log("Delete note", note?.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
} 