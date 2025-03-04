import { drizzle } from 'drizzle-orm/postgres-js';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import {
  user,
  chat,
  message,
  template,
  note,
  task,
  attachment,
  noteShare,
} from '../schema';

// Load environment variables from .env.local at the very beginning
config({ path: '.env.local' });

// Setup database connection
const setupClient = () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  const client = postgres(process.env.POSTGRES_URL, { max: 1 });
  return drizzle(client);
};

// Seed data for testing
export async function seedTestData() {
  const db = setupClient();
  
  console.log('⏳ Clearing existing test data...');
  // Clear existing test data (in reverse order of dependencies)
  await db.delete(noteShare).execute();
  await db.delete(attachment).execute();
  await db.delete(task).execute();
  await db.delete(note).execute();
  await db.delete(message).execute();
  await db.delete(chat).execute();
  await db.delete(template).where(eq(template.isDefault, false)).execute();
  // Don't delete all users, only test ones
  await db.delete(user).where(eq(user.email, 'test@example.com')).execute();
  
  console.log('⏳ Seeding test data...');
  
  // Create test user
  const salt = genSaltSync(10);
  const hash = hashSync('password123', salt);
  const testUserId = randomUUID();
  
  await db.insert(user).values({
    id: testUserId,
    email: 'test@example.com',
    password: hash,
    name: 'Test User',
    createdAt: new Date(),
  }).execute();
  
  console.log('✅ Created test user');
  
  // Create test templates
  const templateIds = [];
  const templateCategories = ['brain-dump', 'journal', 'to-do', 'mood-tracking', 'custom'] as const;
  
  for (let i = 0; i < 5; i++) {
    const templateId = randomUUID();
    
    await db.insert(template).values({
      id: templateId,
      name: `Test Template ${i + 1}`,
      description: `Description for test template ${i + 1}`,
      content: `Content for test template ${i + 1}`,
      category: templateCategories[i % templateCategories.length],
      isDefault: false,
      userId: testUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();
    
    templateIds.push(templateId);
    console.log(`Template created with ID: ${templateId}`);
  }
  
  console.log('✅ Created test templates');
  
  // Create test notes
  const noteIds = [];
  
  for (let i = 0; i < 5; i++) {
    const noteId = randomUUID();
    
    await db.insert(note).values({
      id: noteId,
      title: `Test Note ${i + 1}`,
      content: `Content for test note ${i + 1}`,
      templateId: templateIds[i % templateIds.length],
      userId: testUserId,
      isArchived: i % 5 === 0,
      isDeleted: i % 5 === 1,
      category: templateCategories[i % templateCategories.length],
      lastEditedAt: new Date(),
      createdAt: new Date(),
    }).execute();
    
    noteIds.push(noteId);
    console.log(`Note created with ID: ${noteId}`);
  }
  
  console.log('✅ Created test notes');
  
  // Create test tasks
  for (let i = 0; i < 10; i++) {
    const taskId = randomUUID();
    const noteIndex = i % noteIds.length;
    
    await db.insert(task).values({
      id: taskId,
      content: `Test Task ${i + 1}`,
      isCompleted: i % 2 === 0,
      dueDate: new Date(Date.now() + 86400000 * (i + 1)), // Due date is i+1 days from now
      priority: i % 3,
      noteId: noteIds[noteIndex],
      userId: testUserId,
      createdAt: new Date(),
      completedAt: i % 2 === 0 ? new Date() : null,
    }).execute();
    
    console.log(`Task created with ID: ${taskId} for Note: ${noteIds[noteIndex]}`);
  }
  
  console.log('✅ Created test tasks');
  
  // Create test chat
  const chatId = randomUUID();
  await db.insert(chat).values({
    id: chatId,
    title: 'Test Chat',
    userId: testUserId,
    createdAt: new Date(),
    visibility: 'private',
  }).execute();
  
  console.log(`Chat created with ID: ${chatId}`);
  
  // Create test messages
  for (let i = 0; i < 5; i++) {
    const messageId = randomUUID();
    await db.insert(message).values({
      id: messageId,
      chatId: chatId,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: { text: `Test message ${i + 1}` },
      createdAt: new Date(Date.now() - (5 - i) * 60000), // Messages are 1 minute apart
    }).execute();
    
    console.log(`Message created with ID: ${messageId} for Chat: ${chatId}`);
  }
  
  console.log('✅ Created test chat with messages');
  
  // Create test note share
  const shareId = randomUUID();
  await db.insert(noteShare).values({
    id: shareId,
    noteId: noteIds[0],
    shareLink: `https://hyperscribe.app/share/${shareId}`,
    expiresAt: new Date(Date.now() + 86400000 * 7), // Expires in 7 days
    isActive: true,
    createdAt: new Date(),
    createdBy: testUserId,
  }).execute();
  
  console.log(`Note share created with ID: ${shareId} for Note: ${noteIds[0]}`);
  
  // Create test attachment
  const attachmentId = randomUUID();
  await db.insert(attachment).values({
    id: attachmentId,
    noteId: noteIds[0],
    type: 'image',
    name: 'test-image.jpg',
    url: 'https://example.com/test-image.jpg',
    storageKey: 'attachments/test-image.jpg',
    createdAt: new Date(),
  }).execute();
  
  console.log(`Attachment created with ID: ${attachmentId} for Note: ${noteIds[0]}`);
  
  console.log('✅ All test data has been seeded successfully');
  
  return {
    testUserId,
    noteIds,
    templateIds,
    chatId,
    shareId,
    attachmentId,
  };
}

// Run seeding if this file is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  seedTestData()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
} 