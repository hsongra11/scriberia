import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Template update validation schema
const templateUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

// GET a specific template by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Get the template, ensuring it belongs to the current user
    const [template] = await db
      .select()
      .from(templateSchema)
      .where(
        and(
          eq(templateSchema.id, id),
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
    console.error(`Error getting template:`, error);
    return NextResponse.json(
      { error: "Failed to get template" },
      { status: 500 }
    );
  }
}

// PATCH (update) a specific template
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Verify the template exists and belongs to the current user
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
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Don't allow editing default templates
    if (existingTemplate.isDefault) {
      return NextResponse.json(
        { error: "Cannot modify default templates" },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    const result = templateUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid template data", details: result.error },
        { status: 400 }
      );
    }

    const { name, description, content, category } = result.data;

    // Update the template
    const [updatedTemplate] = await db
      .update(templateSchema)
      .set({
        name,
        description,
        content,
        category,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(templateSchema.id, id),
          eq(templateSchema.userId, session.user.id),
          eq(templateSchema.isDefault, false)
        )
      )
      .returning();

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error(`Error updating template:`, error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE a specific template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Verify the template exists, belongs to the current user, and is not a default template
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
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting default templates
    if (existingTemplate.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default templates" },
        { status: 403 }
      );
    }

    // Delete the template
    await db
      .delete(templateSchema)
      .where(
        and(
          eq(templateSchema.id, id),
          eq(templateSchema.userId, session.user.id),
          eq(templateSchema.isDefault, false)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting template:`, error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
} 