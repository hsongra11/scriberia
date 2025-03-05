import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
  type ImageModel
} from 'ai';
import { 
  initializeProviders, 
  providers 
} from './providers';

export const DEFAULT_CHAT_MODEL: string = 'openai-small';

// Initialize available providers based on environment
const providerInstances = initializeProviders();

// Create language models map with type safety
const languageModels: Record<string, LanguageModelV1> = {};
const imageModels: Record<string, ImageModel> = {};

// Add OpenAI models if available
if (providerInstances.openai) {
  languageModels['openai-small'] = providerInstances.openai(providers.openai.smallModel);
  languageModels['openai-large'] = providerInstances.openai(providers.openai.largeModel);
  languageModels['openai-title'] = providerInstances.openai(providers.openai.titleModel);
  
  imageModels['small-model'] = providerInstances.openai.image('dall-e-2');
  imageModels['large-model'] = providerInstances.openai.image('dall-e-3');
}

// Add Groq models if available
if (providerInstances.groq) {
  languageModels['groq-small'] = providerInstances.groq(providers.groq.smallModel) as any;
  languageModels['groq-large'] = providerInstances.groq(providers.groq.largeModel) as any;
  languageModels['groq-mixtral'] = providerInstances.groq(providers.groq.mixtralModel) as any;
}

// Add Anthropic models if available
if (providerInstances.anthropic) {
  languageModels['anthropic-small'] = providerInstances.anthropic(providers.anthropic.smallModel) as any;
  languageModels['anthropic-large'] = providerInstances.anthropic(providers.anthropic.largeModel) as any;
}

// Add Fireworks models if available
if (providerInstances.fireworks) {
  languageModels['fireworks-reasoning'] = wrapLanguageModel({
    model: providerInstances.fireworks(providers.fireworks.reasoningModel) as any,
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });
}

// Create custom provider with available language models
export const myProvider = customProvider({
  languageModels,
  imageModels,
});

// Helper function to safely get a language model with fallback
export function safeLanguageModel(modelId: string) {
  try {
    // First, try to get the model directly
    if (languageModels[modelId]) {
      return myProvider.languageModel(modelId);
    }
    
    // If it's a Groq model that might be misconfigured with a direct model name
    if (modelId.startsWith('groq-llama3-') || modelId.startsWith('groq-mixtral-')) {
      // Map to the correct ID
      const mappedId = modelId.includes('llama3-8b') ? 'groq-small' :
                      modelId.includes('llama3-70b') ? 'groq-large' :
                      modelId.includes('mixtral') ? 'groq-mixtral' : null;
                      
      if (mappedId && languageModels[mappedId]) {
        console.warn(`Remapping model ${modelId} to ${mappedId}`);
        return myProvider.languageModel(mappedId);
      }
    }
    
    // Fallback to default
    console.warn(`Model ${modelId} not found, falling back to ${DEFAULT_CHAT_MODEL}`);
    return myProvider.languageModel(DEFAULT_CHAT_MODEL);
  } catch (error) {
    console.error(`Error getting language model ${modelId}:`, error);
    return myProvider.languageModel(DEFAULT_CHAT_MODEL);
  }
}

interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'openai-small',
    name: 'OpenAI - Small',
    description: 'Fast and efficient for routine note tasks',
    provider: 'OpenAI'
  },
  {
    id: 'openai-large',
    name: 'OpenAI - Large',
    description: 'Advanced capabilities for complex notes and analysis',
    provider: 'OpenAI'
  },
  {
    id: 'groq-small',
    name: 'Groq - Small',
    description: 'Ultra-fast processing for quick note organization',
    provider: 'Groq'
  },
  {
    id: 'groq-large',
    name: 'Groq - Large',
    description: 'High-capacity model for comprehensive note management',
    provider: 'Groq'
  },
  {
    id: 'groq-mixtral',
    name: 'Groq - Mixtral',
    description: 'Balanced performance for diverse note-taking needs',
    provider: 'Groq'
  },
  {
    id: 'anthropic-small',
    name: 'Claude - Small',
    description: 'Efficient and nuanced note processing',
    provider: 'Anthropic'
  },
  {
    id: 'anthropic-large',
    name: 'Claude - Large',
    description: 'Deep understanding for complex journaling and analysis',
    provider: 'Anthropic'
  },
  {
    id: 'fireworks-reasoning',
    name: 'Reasoning Model',
    description: 'Specialized for task extraction and note organization',
    provider: 'Fireworks'
  },
];

// Get available models filtered by what's available in the environment
export function getAvailableModels(): Array<ChatModel> {
  return chatModels.filter(model => {
    const parts = model.id.split('-');
    const providerName = parts[0];
    
    switch (providerName) {
      case 'openai':
        return !!process.env.OPENAI_API_KEY;
      case 'groq':
        return !!process.env.GROQ_API_KEY;
      case 'anthropic':
        return !!process.env.ANTHROPIC_API_KEY;
      case 'fireworks':
        return !!process.env.FIREWORKS_API_KEY;
      default:
        return false;
    }
  });
}
