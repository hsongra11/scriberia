import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { note as noteSchema, task as taskSchema } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Validation schema for creating a new task
const createTaskSchema = z.object({
  content: z.string().min(1, "Content is required"),
  isCompleted: z.boolean().default(false),
});

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

    const noteId = params.id;

    // Verify the note exists and belongs to the user
    const [note] = await db
      .select()
      .from(noteSchema)
      .where(
        and(
          eq(noteSchema.id, noteId),
          eq(noteSchema.userId, session.user.id)
        )
      );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get tasks for the note
    const tasks = await db
      .select()
      .from(taskSchema)
      .where(eq(taskSchema.noteId, noteId));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const noteId = params.id;

    // Verify the note exists and belongs to the user
    const [note] = await db
      .select()
      .from(noteSchema)
      .where(
        and(
          eq(noteSchema.id, noteId),
          eq(noteSchema.userId, session.user.id)
        )
      );

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid task data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, isCompleted } = validationResult.data;

    // Create a new task
    const [newTask] = await db
      .insert(taskSchema)
      .values({
        content,
        isCompleted,
        noteId,
        userId: session.user.id,
        createdAt: new Date(),
        completedAt: isCompleted ? new Date() : null,
      })
      .returning();

    // Update the lastEditedAt field on the note
    await db
      .update(noteSchema)
      .set({ lastEditedAt: new Date() })
      .where(eq(noteSchema.id, noteId));

    return NextResponse.json({ task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
} 