import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import { groq } from '@ai-sdk/groq';
import { anthropic } from '@ai-sdk/anthropic';
import { customProvider } from 'ai';

// Define provider configuration types
export interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  models: Record<string, string>;
}

// Provider configurations
export const providers = {
  openai: {
    smallModel: 'gpt-4o-mini',
    largeModel: 'gpt-4o',
    titleModel: 'gpt-4-turbo',
    embeddingModel: 'text-embedding-3-small',
  },
  groq: {
    smallModel: 'llama3-8b-8192',
    largeModel: 'llama3-70b-8192',
    mixtralModel: 'mixtral-8x7b-32768',
  },
  anthropic: {
    smallModel: 'claude-3-haiku-20240307',
    largeModel: 'claude-3-opus-20240229',
    embeddingModel: 'claude-3-sonnet-20240229',
  },
  fireworks: {
    reasoningModel: 'accounts/fireworks/models/deepseek-r1',
  },
};

// Initialize provider clients based on environment configuration
export function initializeProviders() {
  // Create provider instances based on available API keys
  const hasOpenAI = process.env.OPENAI_API_KEY;
  const hasGroq = process.env.GROQ_API_KEY;
  const hasAnthropic = process.env.ANTHROPIC_API_KEY;
  const hasFireworks = process.env.FIREWORKS_API_KEY;

  return {
    openai: hasOpenAI ? openai : null,
    groq: hasGroq ? groq : null,
    anthropic: hasAnthropic ? anthropic : null,
    fireworks: hasFireworks ? fireworks : null,
  };
}

// Get available models based on configured providers
export function getAvailableModels() {
  const availableModels = [];
  
  if (process.env.OPENAI_API_KEY) {
    availableModels.push('openai-small', 'openai-large', 'openai-title');
  }
  
  if (process.env.GROQ_API_KEY) {
    availableModels.push('groq-small', 'groq-large', 'groq-mixtral');
  }
  
  if (process.env.ANTHROPIC_API_KEY) {
    availableModels.push('anthropic-small', 'anthropic-large');
  }
  
  if (process.env.FIREWORKS_API_KEY) {
    availableModels.push('fireworks-reasoning');
  }
  
  return availableModels;
}

// Get provider and model name from model ID
export function getProviderAndModel(modelId: string): { provider: string; model: string } {
  const [provider, modelType] = modelId.split('-');
  
  switch (provider) {
    case 'openai':
      return {
        provider: 'openai',
        model: modelType === 'small' 
          ? providers.openai.smallModel 
          : modelType === 'large' 
            ? providers.openai.largeModel 
            : providers.openai.titleModel
      };
    case 'groq':
      return {
        provider: 'groq',
        model: modelType === 'small' 
          ? providers.groq.smallModel 
          : modelType === 'mixtral'
            ? providers.groq.mixtralModel
            : providers.groq.largeModel
      };
    case 'anthropic':
      return {
        provider: 'anthropic',
        model: modelType === 'small' 
          ? providers.anthropic.smallModel 
          : providers.anthropic.largeModel
      };
    case 'fireworks':
      return {
        provider: 'fireworks',
        model: providers.fireworks.reasoningModel
      };
    default:
      return { provider: 'openai', model: providers.openai.smallModel };
  }
} 