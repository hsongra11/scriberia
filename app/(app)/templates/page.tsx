import React from "react";
import Link from "next/link";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { TemplateList } from "@/components/templates/template-list";
import { Plus, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TemplatesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  // Fetch templates from the database
  const templates = await db
    .select()
    .from(templateSchema)
    .where(
      and(
        eq(templateSchema.userId, session.user.id)
      )
    )
    .orderBy(templateSchema.name);

  // Server action to delete a template
  async function deleteTemplate(id: string): Promise<void> {
    "use server";
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    
    if (!db) {
      throw new Error("Database connection not available");
    }
    
    await db
      .delete(templateSchema)
      .where(
        and(
          eq(templateSchema.id, id),
          eq(templateSchema.userId, session.user.id),
          eq(templateSchema.isDefault, false)
        )
      );
  }
  
  // Server action to duplicate a template
  async function duplicateTemplate(id: string): Promise<void> {
    "use server";
    
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    
    if (!db) {
      throw new Error("Database connection not available");
    }
    
    // Get the template to duplicate
    const [templateToDuplicate] = await db
      .select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.id, id),
          eq(templateSchema.userId, session.user.id)
        )
      );
      
    if (!templateToDuplicate) {
      throw new Error("Template not found");
    }
    
    // Insert the duplicated template
    await db.insert(templateSchema).values({
      name: `${templateToDuplicate.name} (Copy)`,
      description: templateToDuplicate.description,
      content: templateToDuplicate.content,
      category: templateToDuplicate.category,
      userId: session.user.id,
      isDefault: false,
      createdAt: new Date(),
    });
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your note templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link href="/templates">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Link>
          </Button>
          <Button asChild>
            <Link href="/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>
      </div>

      <TemplateList 
        templates={templates} 
        onDelete={deleteTemplate}
        onDuplicate={duplicateTemplate}
      />
    </div>
  );
}