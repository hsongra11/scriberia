import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema, note as noteSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema for using a template
const useTemplateSchema = z.object({
  templateId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = useTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { templateId, title, category } = validationResult.data;

    // Get the template, ensuring it belongs to the current user
    const [template] = await db
      .select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.id, templateId),
          eq(templateSchema.userId, session.user.id)
        )
      );

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Create a new note from the template
    const [newNote] = await db
      .insert(noteSchema)
      .values({
        title,
        content: template.content,
        category,
        userId: session.user.id,
        templateId: template.id,
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        lastEditedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Error creating note from template:", error);
    return NextResponse.json(
      { error: "Failed to create note from template" },
      { status: 500 }
    );
  }
} 