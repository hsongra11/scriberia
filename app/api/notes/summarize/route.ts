import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { summarizeNote } from '@/lib/ai/summarize';

export async function POST(request: Request) {
  try {
    const { content, modelId = 'openai-small' } = await request.json();
    
    // Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ 
        success: false,
        summary: 'Cannot summarize empty content' 
      });
    }
    
    // If content is very short, return it as is
    if (content.split(' ').length < 30) {
      return NextResponse.json({ 
        success: true,
        summary: content
      });
    }
    
    // Generate the summary using our utility function
    const summary = await summarizeNote(content, modelId);
    
    // Return the summarized content
    return NextResponse.json({ 
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error summarizing note:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to summarize note'
    }, { status: 500 });
  }
} 