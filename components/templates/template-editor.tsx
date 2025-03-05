"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Template } from "@/lib/db/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateEditorProps {
  template?: Template | null;
  isNew: boolean;
}

export function TemplateEditor({ template, isNew }: TemplateEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with template values or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: template
      ? {
          name: template.name,
          description: template.description || "",
          content: template.content,
          category: template.category,
        }
      : {
          name: "",
          description: "",
          content: "",
          category: "custom",
        },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const endpoint = isNew ? "/api/templates" : `/api/templates/${template?.id}`;
      const method = isNew ? "POST" : "PATCH";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }
      
      toast.success(isNew ? "Template created" : "Template updated");
      router.push("/templates");
      router.refresh();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error((error as Error).message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categoryOptions = [
    { value: "custom", label: "Custom" },
    { value: "brain-dump", label: "Brain Dump" },
    { value: "journal", label: "Journal" },
    { value: "to-do", label: "To-Do List" },
    { value: "mood-tracking", label: "Mood Tracking" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/templates">
            <ArrowLeft className="mr-2 size-4" />
            Back to Templates
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew ? "Create New Template" : "Edit Template"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Weekly Planning Template" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A descriptive name for your template
                </FormDescription>
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
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a category for your template
                </FormDescription>
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
                    placeholder="Briefly describe what this template is for" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  A short description to help you remember what this template is for
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter the content of your template..." 
                    className="min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This will be used as the starting point when creating notes with this template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <Save className="mr-2 size-4" />
              {isSubmitting 
                ? isNew ? "Creating..." : "Updating..." 
                : isNew ? "Create Template" : "Update Template"
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/templates")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 