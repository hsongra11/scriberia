import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { task as taskSchema, note as noteSchema } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for updating a task
const updateTaskSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  isCompleted: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.number().min(0).max(5).optional(),
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

    const taskId = params.id;

    // Get the task, ensuring it belongs to the user
    const [task] = await db
      .select()
      .from(taskSchema)
      .where(
        and(
          eq(taskSchema.id, taskId),
          eq(taskSchema.userId, session.user.id)
        )
      );

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// Update a task
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

    const taskId = params.id;

    // Verify the task exists and belongs to the user
    const [existingTask] = await db
      .select()
      .from(taskSchema)
      .where(
        and(
          eq(taskSchema.id, taskId),
          eq(taskSchema.userId, session.user.id)
        )
      );

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid task data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    
    // Handle completion state change
    const updateValues: any = { ...updateData };
    
    if (updateData.isCompleted !== undefined) {
      if (updateData.isCompleted && !existingTask.isCompleted) {
        // Task is being marked as completed
        updateValues.completedAt = new Date();
      } else if (!updateData.isCompleted && existingTask.isCompleted) {
        // Task is being marked as incomplete
        updateValues.completedAt = null;
      }
    }

    // Parse dueDate if provided
    if (updateData.dueDate !== undefined) {
      updateValues.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }

    // Update the task
    const [updatedTask] = await db
      .update(taskSchema)
      .set(updateValues)
      .where(eq(taskSchema.id, taskId))
      .returning();

    // If the task has a noteId, update the lastEditedAt field on the note
    if (existingTask.noteId) {
      await db
        .update(noteSchema)
        .set({ lastEditedAt: new Date() })
        .where(eq(noteSchema.id, existingTask.noteId));
    }

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// Delete a task
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

    const taskId = params.id;

    // Verify the task exists and belongs to the user
    const [existingTask] = await db
      .select()
      .from(taskSchema)
      .where(
        and(
          eq(taskSchema.id, taskId),
          eq(taskSchema.userId, session.user.id)
        )
      );

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete the task
    await db
      .delete(taskSchema)
      .where(eq(taskSchema.id, taskId));

    // If the task has a noteId, update the lastEditedAt field on the note
    if (existingTask.noteId) {
      await db
        .update(noteSchema)
        .set({ lastEditedAt: new Date() })
        .where(eq(noteSchema.id, existingTask.noteId));
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
} 