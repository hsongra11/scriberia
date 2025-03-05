"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Template } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  mode: "create" | "edit";
  template?: Template;
  userId: string;
}

async function createTemplate(values: TemplateFormValues & { userId: string }) {
  const response = await fetch("/api/templates", {
    method: "POST",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create template");
  }
  
  return response.json();
}

async function updateTemplate(id: string, values: TemplateFormValues) {
  const response = await fetch(`/api/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(values),
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update template");
  }
  
  return response.json();
}

export function TemplateEditor({ mode, template, userId }: TemplateEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      description: template.description || "",
      content: template.content,
      category: template.category,
    } : {
      name: "",
      description: "",
      content: "",
      category: "custom",
    },
  });
  
  function onSubmit(values: TemplateFormValues) {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createTemplate({ ...values, userId });
          toast.success("Template created successfully");
        } else if (template) {
          await updateTemplate(template.id, values);
          toast.success("Template updated successfully");
        }
        router.push("/templates");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred");
      }
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/templates")}
          className="mr-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Create Template" : "Edit Template"}
        </h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Template name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the template" 
                    className="h-20 resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Template content..." 
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/templates")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Template" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 