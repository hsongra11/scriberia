import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { TemplateEditor } from "@/components/templates/template-editor";

interface TemplateEditPageProps {
  params: {
    id: string;
  };
}

export default async function TemplateEditPage({ params }: TemplateEditPageProps) {
  const { id } = params;
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (!db) {
    throw new Error("Database connection not available");
  }
  
  // Check if this is a new template
  if (id === "new") {
    return (
      <div className="container py-6">
        <TemplateEditor 
          mode="create"
          userId={session.user.id || ""}
        />
      </div>
    );
  }
  
  // Get the template
  const [template] = await db
    .select()
    .from(templateSchema)
    .where(
      and(
        eq(templateSchema.id, id),
        eq(templateSchema.userId, session.user.id || "")
      )
    );
  
  if (!template) {
    notFound();
  }
  
  // Don't allow editing default templates
  if (template.isDefault) {
    redirect("/templates");
  }
  
  return (
    <div className="container py-6">
      <TemplateEditor 
        mode="edit"
        template={template}
        userId={session.user.id || ""}
      />
    </div>
  );
} 