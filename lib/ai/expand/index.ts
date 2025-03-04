import { expandNotePrompt } from '../prompts';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Expands note content with additional details using AI
 * 
 * @param content The note content to expand
 * @param modelId The AI model to use for expansion (optional)
 * @returns A promise resolving to the expanded content
 */
export async function expandNote(content: string, modelId: string = 'openai-large'): Promise<string> {
  try {
    if (!content || content.trim().length === 0) {
      return 'Cannot expand empty content';
    }

    // Create the completion with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use a more capable model for expansion
      messages: [
        { role: 'system', content: expandNotePrompt },
        { role: 'user', content }
      ],
      temperature: 0.7, // Higher temperature for more creative expansion
      max_tokens: 1000, // Allow more tokens for expansion
    });

    // Extract the expanded content from the response
    const expandedContent = completion.choices[0]?.message?.content || 'Failed to expand content';
    return expandedContent;
  } catch (error) {
    console.error('Error expanding note:', error);
    throw new Error('Failed to expand note');
  }
} 