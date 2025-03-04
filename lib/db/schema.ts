import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';

// Migrations table for tracking seeding and other migrations
export const migrations = pgTable('Migrations', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  hash: varchar('hash', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Migration = InferSelectModel<typeof migrations>;

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  name: varchar('name', { length: 100 }),
  avatarUrl: text('avatarUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const template = pgTable('Template', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: varchar('category', { 
    enum: ['brain-dump', 'journal', 'to-do', 'mood-tracking', 'custom'] 
  }).notNull(),
  isDefault: boolean('isDefault').notNull().default(false),
  userId: uuid('userId').references(() => user.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type Template = InferSelectModel<typeof template>;

export const note = pgTable('Note', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  templateId: uuid('templateId').references(() => template.id),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  isArchived: boolean('isArchived').notNull().default(false),
  isDeleted: boolean('isDeleted').notNull().default(false),
  category: varchar('category', { 
    enum: ['brain-dump', 'journal', 'to-do', 'mood-tracking', 'custom'] 
  }).notNull(),
  lastEditedAt: timestamp('lastEditedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Note = InferSelectModel<typeof note>;

export const task = pgTable('Task', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  content: text('content').notNull(),
  isCompleted: boolean('isCompleted').notNull().default(false),
  dueDate: timestamp('dueDate'),
  priority: integer('priority').default(0),
  noteId: uuid('noteId').references(() => note.id),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
});

export type Task = InferSelectModel<typeof task>;

export const attachment = pgTable('Attachment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  noteId: uuid('noteId')
    .notNull()
    .references(() => note.id),
  type: varchar('type', { 
    enum: ['audio', 'image', 'file'] 
  }).notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  storageKey: text('storageKey').notNull(),
  transcription: text('transcription'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Attachment = InferSelectModel<typeof attachment>;

export const noteShare = pgTable('NoteShare', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  noteId: uuid('noteId')
    .notNull()
    .references(() => note.id),
  shareLink: text('shareLink').notNull(),
  expiresAt: timestamp('expiresAt'),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  createdBy: uuid('createdBy')
    .notNull()
    .references(() => user.id),
});

export type NoteShare = InferSelectModel<typeof noteShare>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;
