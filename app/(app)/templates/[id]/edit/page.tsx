import React from "react";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { TemplateEditor } from "@/components/templates/template-editor";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateEditPageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TemplateEditPage({ params, searchParams }: TemplateEditPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  // Await params before accessing id
  const id = await params.id;
  const isNewTemplate = id === "new";
  let template = null;

  if (!isNewTemplate) {
    // Fetch existing template
    const [existingTemplate] = await db
      .select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.id, id),
          eq(templateSchema.userId, session.user.id)
        )
      );

    if (!existingTemplate) {
      redirect("/templates");
    }

    template = existingTemplate;
  }

  return (
    <div className="container mx-auto py-8">
      <TemplateEditor 
        template={template} 
        isNew={isNewTemplate}
      />
    </div>
  );
}

export function TemplateEditPageSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
} 