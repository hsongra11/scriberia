import { Message } from 'ai';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { getMostRecentUserMessage, sanitizeResponseMessages } from '@/lib/utils';
import { getTemplateById } from '@/lib/templates';
import { TemplateCategory } from '@/lib/templates/default-templates';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Note } from '@/lib/db/schema';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      noteId,
      messages,
      selectedChatModel,
      templateId,
    }: { 
      noteId?: string; 
      messages: Array<Message>; 
      selectedChatModel: string; 
      templateId?: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Get template category if templateId is provided
    let templateCategory: TemplateCategory | null = null;
    if (templateId) {
      const template = await getTemplateById(templateId);
      if (template) {
        templateCategory = template.category as TemplateCategory;
      }
    }

    // If there's a noteId, get the current note to provide context
    let noteContext = '';
    if (noteId && noteId !== 'new-note') {
      try {
        const note = await db.query.Note.findFirst({
          where: eq(Note.id, noteId),
        });
        
        if (note && note.content) {
          noteContext = `CURRENT NOTE CONTENT:\n${note.content}\n\n`;
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    }

    // Create a system prompt with template context
    const systemMessage = systemPrompt({ 
      selectedChatModel, 
      templateCategory 
    }) + (noteContext ? `\n\n${noteContext}` : '');
    
    // Prepare messages for the model
    const aiMessages = [
      { role: 'system', content: systemMessage },
      ...sanitizeResponseMessages(messages),
    ];

    // Get the model
    const model = myProvider.languageModel(selectedChatModel);
    
    // Generate response
    const response = await model.invoke(aiMessages);
    
    // Return response
    return NextResponse.json({ 
      role: 'assistant',
      content: response,
      id: Date.now().toString(),
    });
  } catch (error) {
    console.error('Error in notes chat:', error);
    return new Response('Error processing your request', { status: 500 });
  }
} 