import { nanoid } from 'nanoid';
import { StreamData } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { Note } from '../db/schema';

// Define the GeneratedTask type
export interface GeneratedTask {
  content: string;
  priority: number;
  dueDate: Date | null;
}

// Define the TaskSchema
const TaskSchema = z.object({
  tasks: z.array(
    z.object({
      content: z.string(),
      priority: z.number(),
      dueDate: z.string().nullable(),
    })
  )
});

// Define the output schema for task generation
const parser = StructuredOutputParser.fromZodSchema(
  z.array(
    z.object({
      content: z.string().describe('The task description.'),
      priority: z.number().describe('Priority from 1-3 with 1 being highest priority.'),
      dueDate: z.string().optional().describe('The due date in YYYY-MM-DD format, if applicable.'),
    })
  )
);

// Template for generating tasks from note content
const template = `
Based on the following note content, generate a list of actionable tasks.
Extract any explicit tasks mentioned, and also infer implicit tasks that would help accomplish what's in the note.

Note Title: {noteTitle}
Note Content:
{noteContent}

{format_instructions}

Return only the JSON array of tasks.
`;

// Create the prompt template
const prompt = PromptTemplate.fromTemplate(template);

// Function to generate tasks from a note
export async function generateTasksFromNote(note: Note) {
  try {
    // Initialize the OpenAI model
    const model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.2,
    });

    // Create a stream data object to track the generated tasks
    const stream = new StreamData();

    // Format the prompt with the note details and parser instructions
    const formattedPrompt = await prompt.format({
      noteTitle: note.title,
      noteContent: note.content,
      format_instructions: parser.getFormatInstructions(),
    });

    // Call the model with streaming enabled
    const response = model.call([
      { role: 'user', content: formattedPrompt }
    ]);

    // Parse the response
    const result = await response;
    const parsed = await parser.parse(result.content as string);

    // Process each task in the parsed response
    const tasks = parsed.map((task: any) => ({
      content: task.content,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }));

    // Set the data and close the stream
    stream.append(JSON.parse(JSON.stringify(tasks)));
    stream.close();

    // Return the processed tasks
    return tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate tasks from note');
  }
}

export async function validateAndFormatTasks(rawTasks: any[]): Promise<GeneratedTask[]> {
  try {
    // Validate the generated tasks against our schema
    const result = TaskSchema.parse({ tasks: rawTasks });
    
    // Process due dates (convert from string to Date where applicable)
    return result.tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }));
  } catch (error) {
    console.error('Error validating tasks:', error);
    return [];
  }
}

export function formatTasksForCreation(generatedTasks: GeneratedTask[], noteId?: string, userId?: string) {
  return generatedTasks.map(task => ({
    id: nanoid(),
    content: task.content,
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    isCompleted: false,
    noteId: noteId || null,
    userId: userId,
    createdAt: new Date(),
    completedAt: null,
  }));
} 