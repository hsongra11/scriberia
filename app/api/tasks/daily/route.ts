import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { task } from '@/lib/db/schema';
import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 5;

    // Get today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get tasks that:
    // 1. Are due today
    // 2. Have no due date but are not completed
    // 3. Are overdue and not completed
    const tasks = await db
      .select()
      .from(task)
      .where(
        and(
          eq(task.userId, session.user.id),
          or(
            // Due today
            and(
              gte(task.dueDate, today),
              lte(task.dueDate, tomorrow)
            ),
            // No due date but not completed
            and(
              isNull(task.dueDate),
              eq(task.isCompleted, false)
            ),
            // Overdue and not completed
            and(
              lte(task.dueDate, today),
              eq(task.isCompleted, false)
            )
          )
        )
      )
      .orderBy(
        // Completed tasks at the bottom
        task.isCompleted,
        // Then sort by priority (high to low)
        desc(task.priority),
        // Then sort by due date (closest first)
        task.dueDate
      )
      .limit(limit);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching daily tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily tasks' },
      { status: 500 }
    );
  }
} 