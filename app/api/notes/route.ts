import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { note, attachment } from '@/lib/db/schema';
import { desc, eq, and, like, or, count, sql, inArray, SQL } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for creating a new note
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().default(""),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
  templateId: z.string().uuid().optional(),
});

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
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');
    const filter = url.searchParams.get('filter');
    const search = url.searchParams.get('search');

    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 12;
    const offset = (page - 1) * pageSize;

    // Build the base query conditions
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    let conditions = [
      eq(note.userId, session.user.id),
      eq(note.isDeleted, false),
    ];

    // Add filter conditions
    if (filter) {
      switch (filter) {
        case 'brain-dump':
        case 'journal':
        case 'to-do':
        case 'mood-tracking':
        case 'custom':
          conditions.push(eq(note.category, filter));
          break;
        case 'archived':
          conditions.push(eq(note.isArchived, true));
          break;
        case 'audio':
          // This will be handled by a join with attachments
          break;
        default:
          // For 'all' or invalid filters, don't add additional conditions
          break;
      }
    } else {
      // If no filter is specified, exclude archived notes by default
      conditions.push(eq(note.isArchived, false));
    }

    // Add search condition
    if (search) {
      // Type assertion to ensure it's treated as SQL<unknown>
      const searchCondition = or(
        like(note.title, `%${search}%`),
        like(note.content, `%${search}%`)
      ) as SQL<unknown>;
      
      conditions.push(searchCondition);
    }

    // Create base query for total count
    if (!db) {
      throw new Error("Database connection not available");
    }
    
    const countQuery = db
      .select({ count: count() })
      .from(note)
      .where(and(...conditions));

    // Special handling for audio filter
    if (filter === 'audio') {
      countQuery.innerJoin(
        attachment,
        and(
          eq(attachment.noteId, note.id),
          eq(attachment.type, 'audio')
        )
      );
    }

    // Execute count query
    const [countResult] = await countQuery;
    const totalCount = countResult?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Create query for notes with pagination
    let notesQuery = db
      .select({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        lastEditedAt: note.lastEditedAt,
        category: note.category,
        isArchived: note.isArchived,
      })
      .from(note)
      .where(and(...conditions))
      .orderBy(desc(note.lastEditedAt))
      .limit(pageSize)
      .offset(offset);

    // Special handling for audio filter
    if (filter === 'audio') {
      notesQuery = notesQuery.innerJoin(
        attachment,
        and(
          eq(attachment.noteId, note.id),
          eq(attachment.type, 'audio')
        )
      );
    }

    // Execute notes query
    const notes = await notesQuery;

    // Get attachments for notes
    const noteIds = notes.map(note => note.id);
    
    const attachmentsResult = noteIds.length > 0 && db
      ? await db
          .select({
            id: attachment.id,
            noteId: attachment.noteId,
            type: attachment.type,
            url: attachment.url,
          })
          .from(attachment)
          .where(
            and(
              eq(attachment.type, 'audio'),
              inArray(attachment.noteId, noteIds)
            )
          )
      : [];

    // Group attachments by note ID
    const attachmentsByNoteId = attachmentsResult.reduce((acc, attachment) => {
      if (!acc[attachment.noteId]) {
        acc[attachment.noteId] = [];
      }
      acc[attachment.noteId].push(attachment);
      return acc;
    }, {} as Record<string, typeof attachmentsResult>);

    // Combine notes with their attachments
    const notesWithAttachments = notes.map(note => ({
      ...note,
      attachments: attachmentsByNoteId[note.id] || [],
    }));

    return NextResponse.json({
      notes: notesWithAttachments,
      totalPages,
      page,
      pageSize,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createNoteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid note data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { title, content, category, templateId } = validationResult.data;
    
    const [newNote] = await db
      .insert(note)
      .values({
        title,
        content,
        category,
        userId: session.user.id,
        templateId: templateId || null,
        createdAt: new Date(),
        lastEditedAt: new Date(),
        isArchived: false,
        isDeleted: false,
      })
      .returning();

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 