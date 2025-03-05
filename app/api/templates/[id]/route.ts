import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema for updating templates
const updateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

// GET a specific template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const templateId = await params.id;

    // Get the template by ID, ensuring it belongs to the current user
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

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PATCH (update) a specific template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const templateId = await params.id;
    
    // Verify the template exists and belongs to the user
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

    // Don't allow editing default templates
    if (template.isDefault) {
      return NextResponse.json(
        { error: "Cannot modify default templates" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid template data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, content, category } = validationResult.data;

    // Update the template
    const [updatedTemplate] = await db
      .update(templateSchema)
      .set({
        name,
        description: description || null,
        content,
        category,
        updatedAt: new Date(),
      })
      .where(eq(templateSchema.id, templateId))
      .returning();

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE a specific template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const templateId = await params.id;
    
    // Verify the template exists and belongs to the user
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
        { error: "Template not found or unauthorized" },
        { status: 404 }
      );
    }

    // Don't allow deleting default templates
    if (template.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default templates" },
        { status: 403 }
      );
    }

    // Delete the template
    await db
      .delete(templateSchema)
      .where(eq(templateSchema.id, templateId));

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
} 