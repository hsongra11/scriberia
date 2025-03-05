"use client";

import { useState } from "react";
import Link from "next/link";
import type { Template } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Copy, Trash, Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TemplateListProps {
  templates: Template[];
  onDelete?: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
}

export function TemplateList({ templates, onDelete, onDuplicate }: TemplateListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "brain-dump":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "journal":
        return "bg-blue-500 hover:bg-blue-600";
      case "to-do":
        return "bg-green-500 hover:bg-green-600";
      case "mood-tracking":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };
  
  const formatCategory = (category: string) => {
    return category
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FileText className="size-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Templates</h3>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t created any templates yet.
        </p>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="mr-2 size-4" />
            Create New Template
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge 
                className={cn(
                  "mb-2",
                  getCategoryColor(template.category)
                )}
              >
                {formatCategory(template.category)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/templates/${template.id}/edit`)}>
                    <Edit className="mr-2 size-4" />
                    Edit
                  </DropdownMenuItem>
                  {onDuplicate && (
                    <DropdownMenuItem 
                      onClick={async () => {
                        try {
                          await onDuplicate(template.id);
                          toast.success("Template duplicated");
                        } catch (error) {
                          toast.error("Failed to duplicate template");
                        }
                      }}
                    >
                      <Copy className="mr-2 size-4" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {!template.isDefault && onDelete && (
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this template?")) {
                          try {
                            await onDelete(template.id);
                            toast.success("Template deleted");
                          } catch (error) {
                            toast.error("Failed to delete template");
                          }
                        }
                      }}
                    >
                      <Trash className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="grow">
            <div className={cn(
              "text-sm text-muted-foreground whitespace-pre-wrap overflow-hidden transition-all",
              expandedId === template.id ? "max-h-96" : "max-h-24"
            )}>
              {template.content}
            </div>
            {template.content.length > 120 && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => toggleExpand(template.id)}
                className="p-0 h-auto mt-1 text-xs"
              >
                {expandedId === template.id ? "Show less" : "Show more"}
              </Button>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => router.push(`/notes/new?template=${template.id}`)}
            >
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 