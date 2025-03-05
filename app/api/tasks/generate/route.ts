import { auth } from '@/app/(auth)/auth';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { task as taskTable } from '@/lib/db/schema';
import { generateTasksFromNote, formatTasksForCreation, validateAndFormatTasks } from '@/lib/ai/task-generator';
import { z } from 'zod';

const requestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  noteId: z.string().optional(),
  maxTasks: z.number().min(1).max(10).default(5),
  model: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Validate request body
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { content, noteId, maxTasks, model } = validationResult.data;
    
    // For streaming response (AI generating tasks)
    if (request.headers.get('accept') === 'text/event-stream') {
      // Create a mock note from the content
      const mockNote = {
        id: noteId || 'temp-id',
        title: 'Content Analysis',
        content,
        userId: userId || '',
        createdAt: new Date(),
        lastEditedAt: new Date(),
        isDeleted: false,
        isArchived: false,
        category: 'custom' as const,
        templateId: null
      };
      
      return generateTasksFromNote(mockNote);
    }
    
    // For direct API usage (non-streaming)
    try {
      // Process the content and extract tasks
      const rawTasksResponse = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ content, maxTasks, model }),
      });
      
      if (!rawTasksResponse.ok) {
        throw new Error('Failed to generate tasks');
      }
      
      const rawTasks = await rawTasksResponse.json();
      const validatedTasks = await validateAndFormatTasks(rawTasks.tasks);
      
      if (!validatedTasks.length) {
        return NextResponse.json({ tasks: [] }, { status: 200 });
      }
      
      // Format tasks for insertion into the database
      const tasksToCreate = formatTasksForCreation(validatedTasks, noteId, userId);
      
      // Extract tasks and save them to the database
      if (tasksToCreate.length > 0 && db) {
        // Make sure userId is a string
        const tasksWithValidUserId = tasksToCreate.map(t => ({
          ...t,
          userId: t.userId || ''
        }));
        
        await db.insert(taskTable).values(tasksWithValidUserId).returning();
      }
      
      return NextResponse.json({ tasks: tasksToCreate }, { status: 200 });
    } catch (error) {
      console.error('Error in task generation:', error);
      return NextResponse.json(
        { error: 'Failed to generate tasks', details: (error as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 