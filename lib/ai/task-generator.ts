import { nanoid } from 'nanoid';
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Define the output schema for task generation
export const TaskSchema = z.object({
  tasks: z.array(
    z.object({
      content: z.string().describe('The task content/description'),
      priority: z.number().min(1).max(3).describe('Priority level: 1 (Low), 2 (Medium), 3 (High)'),
      dueDate: z.string().optional().describe('ISO string of the due date (if applicable)'),
    })
  ),
});

export type GeneratedTask = z.infer<typeof TaskSchema>['tasks'][number];

const TASK_SYSTEM_PROMPT = `
You are an intelligent task extraction assistant that helps users identify actionable tasks from their notes or conversations.

Your job is to:
1. Analyze the provided text
2. Extract meaningful, actionable tasks
3. Assign appropriate priority levels (1=Low, 2=Medium, 3=High) based on context and urgency
4. Set reasonable due dates when time elements are mentioned (or leave empty if not specified)
5. Format the output as a structured list of tasks

Prioritize clarity, practicality, and usefulness in the extracted tasks.
Output ONLY the requested JSON structure without any additional explanation.
`;

export async function generateTasksFromText(
  content: string,
  options?: {
    maxTasks?: number;
    model?: string;
  }
) {
  const { maxTasks = 5, model = 'gpt-3.5-turbo' } = options || {};
  
  const parser = StructuredOutputParser.fromZodSchema(TaskSchema);
  const formatInstructions = parser.getFormatInstructions();

  const prompt = PromptTemplate.fromTemplate(`
{systemPrompt}

TEXT TO ANALYZE:
"""
{userText}
"""

INSTRUCTIONS:
Extract up to {maxTasks} actionable tasks from the text above.
For each task:
- Create a clear, concise task description
- Assign a priority (1=Low, 2=Medium, 3=High) based on perceived urgency and importance
- If a specific timeframe is mentioned, include a due date in ISO format (YYYY-MM-DD), otherwise leave it blank

{formatInstructions}
`);

  const { stream, handlers } = LangChainStream();

  const llm = new ChatOpenAI({
    modelName: model,
    temperature: 0.2,
    streaming: true,
  });

  const chain = prompt.pipe(llm).pipe(parser);

  // Execute the chain with the event handler to enable streaming
  chain.invoke(
    {
      systemPrompt: TASK_SYSTEM_PROMPT,
      userText: content,
      maxTasks: maxTasks.toString(),
      formatInstructions,
    },
    {
      callbacks: [handlers],
    },
  );

  return new StreamingTextResponse(stream);
}

export async function validateAndFormatTasks(rawTasks: any[]): Promise<GeneratedTask[]> {
  try {
    // Validate the generated tasks against our schema
    const result = TaskSchema.parse({ tasks: rawTasks });
    
    // Process due dates (convert from string to Date where applicable)
    return result.tasks.map(task => ({
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
    updatedAt: new Date(),
    completedAt: null,
  }));
} 