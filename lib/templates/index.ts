import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { template, type Template, note } from '@/lib/db/schema';
import { DEFAULT_TEMPLATES, processTemplateContent, type TemplateCategory } from './default-templates';
import { randomUUID } from 'node:crypto';

// Get templates for a user including default templates
export async function getUserTemplates(userId: string): Promise<Template[]> {
  try {
    // Get user-created templates
    const userTemplates = await db
      .select()
      .from(template)
      .where(eq(template.userId, userId))
      .orderBy(desc(template.updatedAt));

    // Get default templates (only if user doesn't have them already)
    const defaultTemplates = await db
      .select()
      .from(template)
      .where(eq(template.isDefault, true));
    
    // Combine templates, prioritizing user-created ones
    const userTemplateNames = userTemplates.map((t: Template) => t.name);
    const filteredDefaults = defaultTemplates.filter((dt: Template) => !userTemplateNames.includes(dt.name));
    
    return [...userTemplates, ...filteredDefaults];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

// Get templates by category for a user
export async function getTemplatesByCategory(userId: string, category: TemplateCategory): Promise<Template[]> {
  try {
    // Get user templates in this category
    const userTemplates = await db
      .select()
      .from(template)
      .where(and(
        eq(template.userId, userId),
        eq(template.category, category)
      ))
      .orderBy(desc(template.updatedAt));
    
    // Get default templates in this category (only if user doesn't have them already)
    const defaultTemplates = await db
      .select()
      .from(template)
      .where(and(
        eq(template.isDefault, true),
        eq(template.category, category)
      ));
    
    // Combine templates, prioritizing user-created ones
    const userTemplateNames = userTemplates.map((t: Template) => t.name);
    const filteredDefaults = defaultTemplates.filter((dt: Template) => !userTemplateNames.includes(dt.name));
    
    return [...userTemplates, ...filteredDefaults];
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    return [];
  }
}

// Get a template by ID
export async function getTemplateById(templateId: string): Promise<Template | null> {
  try {
    const [foundTemplate] = await db
      .select()
      .from(template)
      .where(eq(template.id, templateId));
    
    return foundTemplate || null;
  } catch (error) {
    console.error('Error fetching template by ID:', error);
    return null;
  }
}

// Create a new template
export async function createTemplate(data: {
  name: string;
  description?: string;
  content: string;
  category: TemplateCategory;
  userId: string;
}): Promise<Template | null> {
  try {
    const templateId = randomUUID();
    
    const [newTemplate] = await db.insert(template).values({
      id: templateId,
      name: data.name,
      description: data.description || '',
      content: data.content,
      category: data.category,
      userId: data.userId,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return newTemplate;
  } catch (error) {
    console.error('Error creating template:', error);
    return null;
  }
}

// Update an existing template
export async function updateTemplate(
  templateId: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    content: string;
    category: TemplateCategory;
  }>
): Promise<Template | null> {
  try {
    // Check ownership (can't update default templates)
    const [templateToUpdate] = await db
      .select()
      .from(template)
      .where(and(
        eq(template.id, templateId),
        eq(template.userId, userId)
      ));
    
    if (!templateToUpdate) {
      throw new Error('Template not found or you do not have permission to update it');
    }
    
    // Update the template
    const [updatedTemplate] = await db
      .update(template)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(template.id, templateId))
      .returning();
    
    return updatedTemplate;
  } catch (error) {
    console.error('Error updating template:', error);
    return null;
  }
}

// Delete a template
export async function deleteTemplate(templateId: string, userId: string): Promise<boolean> {
  try {
    // Check if template is used by any notes
    const [noteUsingTemplate] = await db
      .select({ id: note.id })
      .from(note)
      .where(eq(note.templateId, templateId))
      .limit(1);
    
    if (noteUsingTemplate) {
      throw new Error('Cannot delete template that is used by notes');
    }
    
    // Check ownership
    const [templateToDelete] = await db
      .select()
      .from(template)
      .where(and(
        eq(template.id, templateId),
        eq(template.userId, userId)
      ));
    
    if (!templateToDelete) {
      throw new Error('Template not found or you do not have permission to delete it');
    }
    
    // Delete the template
    await db
      .delete(template)
      .where(eq(template.id, templateId));
    
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}

// Create a note from a template
export async function createNoteFromTemplate(
  templateId: string,
  userId: string,
  title: string,
  additionalValues: Record<string, string> = {}
): Promise<{ id: string } | null> {
  try {
    // Get the template
    const templateData = await getTemplateById(templateId);
    
    if (!templateData) {
      throw new Error('Template not found');
    }
    
    // Process the template content
    const processedContent = processTemplateContent(templateData.content, {
      title,
      ...additionalValues,
    });
    
    // Create the note
    const noteId = randomUUID();
    
    const [newNote] = await db.insert(note).values({
      id: noteId,
      title,
      content: processedContent,
      templateId,
      userId,
      category: templateData.category,
      isArchived: false,
      isDeleted: false,
      lastEditedAt: new Date(),
      createdAt: new Date(),
    }).returning({ id: note.id });
    
    return newNote;
  } catch (error) {
    console.error('Error creating note from template:', error);
    return null;
  }
}

// Initialize default templates for a new user
export async function initializeDefaultTemplates(userId: string): Promise<void> {
  try {
    // Check if user already has templates
    const userTemplates = await db
      .select()
      .from(template)
      .where(eq(template.userId, userId));
    
    if (userTemplates.length > 0) {
      // User already has templates
      return;
    }
    
    // Create default templates for the user
    const defaultTemplatesWithUserId = DEFAULT_TEMPLATES.map(tmpl => ({
      ...tmpl,
      id: randomUUID(),
      userId,
      isDefault: false, // These become user's own templates
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await db.insert(template).values(defaultTemplatesWithUserId);
    
  } catch (error) {
    console.error('Error initializing default templates:', error);
  }
} 