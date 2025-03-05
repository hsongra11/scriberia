import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { task } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

// Update a task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;
    const body = await req.json();
    
    // Check if the task exists and belongs to the user
    const existingTask = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingTask.length) {
      return NextResponse.json(
        { error: 'Task not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if ('content' in body) {
      updateData.content = body.content;
    }
    
    if ('isCompleted' in body) {
      updateData.isCompleted = !!body.isCompleted;
      updateData.completedAt = body.isCompleted ? new Date() : null;
    }
    
    if ('dueDate' in body) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }
    
    if ('priority' in body) {
      updateData.priority = body.priority;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the task
    const [updatedTask] = await db
      .update(task)
      .set(updateData)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const taskId = params.id;
    
    // Check if the task exists and belongs to the user
    const existingTask = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingTask.length) {
      return NextResponse.json(
        { error: 'Task not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the task
    await db
      .delete(task)
      .where(
        and(
          eq(task.id, taskId),
          eq(task.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 