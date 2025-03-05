"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Template } from "@/lib/db/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TemplateListProps {
  templates: Template[];
  onDelete: (id: string) => Promise<void>;
}

export function TemplateList({ templates, onDelete }: TemplateListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await onDelete(id);
      toast.success("Template deleted successfully");
    } catch (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/templates/${id}/edit`);
  };

  const handleCreate = () => {
    router.push("/templates/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Templates</h2>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h3 className="font-medium text-lg mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create custom templates for your notes to speed up your workflow.
          </p>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{template.name}</span>
                  <Badge variant={template.isDefault ? "default" : "outline"}>
                    {template.isDefault ? "Default" : "Custom"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground line-clamp-3">{template.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template.id)}
                  disabled={deleting === template.id}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  disabled={deleting === template.id || template.isDefault}
                >
                  {deleting === template.id ? (
                    <>
                      <span className="mr-2">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 