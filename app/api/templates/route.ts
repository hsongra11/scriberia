import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { z } from "zod";

// Template validation schema
const templateFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
  userId: z.string().uuid(),
});

// GET all templates for the current user
export async function GET(req: NextRequest) {
  try {
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

    // Get all templates for the user
    const templates = await db
      .select()
      .from(templateSchema)
      .where(({ eq }) => eq(templateSchema.userId, session.user.id))
      .orderBy(({ asc, desc }) => [
        desc(templateSchema.isDefault),
        asc(templateSchema.name)
      ]);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error getting templates:", error);
    return NextResponse.json(
      { error: "Failed to get templates" },
      { status: 500 }
    );
  }
}

// POST a new template
export async function POST(req: NextRequest) {
  try {
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

    // Parse and validate the request body
    const body = await req.json();
    const result = templateFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid template data", details: result.error },
        { status: 400 }
      );
    }

    const { name, description, content, category, userId } = result.data;

    // Verify the userId matches the session user's ID
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "User ID mismatch" },
        { status: 403 }
      );
    }

    // Create the new template
    const [newTemplate] = await db
      .insert(templateSchema)
      .values({
        name,
        description,
        content,
        category,
        userId,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ template: newTemplate });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
} 