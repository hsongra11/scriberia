import { summarizeNotePrompt } from '../prompts';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Summarizes note content using AI
 * 
 * @param content The note content to summarize
 * @param modelId The AI model to use for summarization (optional)
 * @returns A promise resolving to the summarized content
 */
export async function summarizeNote(content: string, modelId = 'openai-small'): Promise<string> {
  try {
    if (!content || content.trim().length === 0) {
      return 'Cannot summarize empty content';
    }

    // If content is very short, return it as is
    if (content.split(' ').length < 30) {
      return content;
    }

    // Create the completion with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use a consistent model for summarization
      messages: [
        { role: 'system', content: summarizeNotePrompt },
        { role: 'user', content }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Extract the summary from the response
    const summary = completion.choices[0]?.message?.content || 'Failed to generate summary';
    return summary;
  } catch (error) {
    console.error('Error summarizing note:', error);
    throw new Error('Failed to summarize note');
  }
} 