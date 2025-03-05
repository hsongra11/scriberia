import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { generateShareLink, deactivateShareLink } from '@/lib/sharing/generate-link';
import { z } from 'zod';

const shareRequestSchema = z.object({
  noteId: z.string().uuid(),
  expiresInDays: z.number().min(0).max(30).optional(),
});

const deactivateRequestSchema = z.object({
  shareId: z.string().uuid(),
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
    const validationResult = shareRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { noteId, expiresInDays } = validationResult.data;
    
    // Generate share link
    const shareData = await generateShareLink({
      noteId,
      userId,
      expiresInDays,
    });
    
    return NextResponse.json(shareData, { status: 200 });
  } catch (error) {
    console.error('Error sharing note:', error);
    return NextResponse.json(
      { error: 'Failed to share note', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = deactivateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { shareId } = validationResult.data;
    
    // Deactivate share link
    const result = await deactivateShareLink(shareId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deactivating share link:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate share link', details: (error as Error).message },
      { status: 500 }
    );
  }
} 