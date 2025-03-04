import { Template } from '@/lib/db/schema';

// Default template categories
export type TemplateCategory = 'brain-dump' | 'journal' | 'to-do' | 'mood-tracking' | 'custom';

// Template content with placeholders
export const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'userId'>[] = [
  {
    name: 'Blank Note',
    description: 'A simple blank note for general use.',
    content: '',
    category: 'custom',
    isDefault: true,
  },
  {
    name: 'Meeting Notes',
    description: 'Template for taking notes during meetings with sections for agenda, decisions, and action items.',
    content: `# Meeting: {{title}}
Date: {{date}}

## Attendees
- 

## Agenda
- 

## Notes
- 

## Decisions
- 

## Action Items
- [ ] 
- [ ] 
`,
    category: 'custom',
    isDefault: true,
  },
  {
    name: 'Brain Dump',
    description: 'Quick capture of thoughts and ideas without structure.',
    content: `# Brain Dump: {{date}}

## Thoughts
- 

## Ideas
- 

## Questions
- 

## Random Musings
- 
`,
    category: 'brain-dump',
    isDefault: true,
  },
  {
    name: 'To-Do List',
    description: 'Structured template for creating and tracking tasks.',
    content: `# To-Do List: {{date}}

## High Priority
- [ ] 
- [ ] 

## Medium Priority
- [ ] 
- [ ] 

## Low Priority
- [ ] 
- [ ] 

## Notes
- 
`,
    category: 'to-do',
    isDefault: true,
  },
  {
    name: 'Daily Journal',
    description: 'Template for daily reflections, gratitude, and goals.',
    content: `# Journal Entry: {{date}}

## Today I'm Grateful For
- 
- 
- 

## How I Feel Today
Mood: 
Energy Level: 

## Main Goals for Today
- [ ] 
- [ ] 
- [ ] 

## Reflections
- 

## Tomorrow's Plan
- 
`,
    category: 'journal',
    isDefault: true,
  },
  {
    name: 'Mood Tracker',
    description: 'Track your mood and factors affecting it throughout the day.',
    content: `# Mood Tracker: {{date}}

## Morning
Mood (1-10): 
Energy (1-10): 
Notes: 

## Afternoon
Mood (1-10): 
Energy (1-10): 
Notes: 

## Evening
Mood (1-10): 
Energy (1-10): 
Notes: 

## Factors Today
Sleep: 
Exercise: 
Nutrition: 
Social Interaction: 
Stress Level: 

## Reflections
-
`,
    category: 'mood-tracking',
    isDefault: true,
  },
  {
    name: 'Project Plan',
    description: 'Structured template for planning projects with goals, timelines, and resources.',
    content: `# Project: {{title}}

## Project Overview
- Start Date: 
- Target Completion: 
- Project Owner: 

## Objectives
- 
- 

## Success Criteria
- 
- 

## Timeline / Milestones
- [ ] 
- [ ] 
- [ ] 

## Resources Needed
- 

## Risks & Challenges
- 

## Notes
- 
`,
    category: 'custom',
    isDefault: true,
  },
];

// Functions to get templates by category
export function getTemplatesByCategory(category: TemplateCategory) {
  return DEFAULT_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateByName(name: string) {
  return DEFAULT_TEMPLATES.find(template => template.name === name);
}

// Utility function to process template content with dynamic values
export function processTemplateContent(
  content: string, 
  values: Record<string, string> = {}
): string {
  let processedContent = content;
  
  // Replace {{date}} with current date
  if (content.includes('{{date}}')) {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    processedContent = processedContent.replace(/\{\{date\}\}/g, formattedDate);
  }
  
  // Replace all other placeholders
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedContent = processedContent.replace(placeholder, value);
  });
  
  return processedContent;
} 