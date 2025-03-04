import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { expandNote } from '@/lib/ai/expand';

export async function POST(request: Request) {
  try {
    const { content, modelId = 'openai-large' } = await request.json();
    
    // Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        success: false,
        expanded: 'Cannot expand empty content' 
      });
    }
    
    // Generate the expanded content using our utility function
    const expanded = await expandNote(content, modelId);
    
    // Return the expanded content
    return NextResponse.json({ 
      success: true,
      expanded
    });
  } catch (error) {
    console.error('Error expanding note:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to expand note'
    }, { status: 500 });
  }
}
