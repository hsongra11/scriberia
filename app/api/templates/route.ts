import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { template as templateSchema } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema for templates
const templateValidator = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

// GET all templates for the current user
export async function GET(request: NextRequest) {
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

    // Get templates for the authenticated user
    const templates = await db
      .select()
      .from(templateSchema)
      .where(eq(templateSchema.userId, session.user.id))
      .orderBy(templateSchema.name);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST a new template
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
    const validationResult = templateValidator.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid template data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, content, category } = validationResult.data;

    // Insert new template
    const [newTemplate] = await db
      .insert(templateSchema)
      .values({
        name,
        description: description || null,
        content,
        category,
        userId: session.user.id,
        isDefault: false,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
} 