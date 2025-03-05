import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";
import { TemplateList } from "@/components/templates/template-list";
import { redirect } from "next/navigation";

async function deleteTemplate(id: string) {
  "use server";
  
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  
  if (!db) {
    throw new Error("Database connection not available");
  }
  
  await db
    .delete(templateSchema)
    .where(({ and, eq }) => 
      and(
        eq(templateSchema.id, id), 
        eq(templateSchema.userId, session.user.id),
        eq(templateSchema.isDefault, false)
      )
    );
    
  return { success: true };
}

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  
  if (!db) {
    throw new Error("Database connection not available");
  }
  
  const templates = await db
    .select()
    .from(templateSchema)
    .where(({ eq }) => eq(templateSchema.userId, session.user.id))
    .orderBy(({ asc, desc }) => [
      desc(templateSchema.isDefault),
      asc(templateSchema.name)
    ]);
  
  return (
    <div className="container py-6">
      <TemplateList 
        templates={templates} 
        onDelete={deleteTemplate} 
      />
    </div>
  );
}