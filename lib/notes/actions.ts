"use server";

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { note as noteSchema, template as templateSchema } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const noteFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string(),
  category: z.enum(["custom", "brain-dump", "journal", "to-do", "mood-tracking"]),
});

// Get a note by ID, ensuring it belongs to the current user
export async function getNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  const [note] = await db
    .select()
    .from(noteSchema)
    .where(
      and(
        eq(noteSchema.id, id),
        eq(noteSchema.userId, session.user.id),
        eq(noteSchema.isDeleted, false)
      )
    );

  if (!note) {
    return { error: "Note not found" };
  }

  return { note };
}

// Get user's templates
export async function getUserTemplates() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  const templates = await db
    .select()
    .from(templateSchema)
    .where(
      and(
        eq(templateSchema.userId, session.user.id)
      )
    )
    .orderBy(desc(templateSchema.isDefault));

  return { templates };
}

// Create a new note
export async function createNote(formData: FormData | z.infer<typeof noteFormSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    // Handle both FormData and plain objects
    const values = formData instanceof FormData
      ? {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          category: formData.get("category") as any,
        }
      : formData;

    const validationResult = noteFormSchema.safeParse(values);
    if (!validationResult.success) {
      return { error: "Invalid form data", details: validationResult.error.format() };
    }

    const { title, content, category } = validationResult.data;

    const [newNote] = await db
      .insert(noteSchema)
      .values({
        title: title || "Untitled Note",
        content: content || "",
        category: category || "custom",
        userId: session.user.id,
        createdAt: new Date(),
        lastEditedAt: new Date(),
        isDeleted: false,
      })
      .returning();

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    
    return { note: newNote };
  } catch (error) {
    console.error("Error creating note:", error);
    return { error: "Failed to create note" };
  }
}

// Update an existing note
export async function updateNote(
  id: string,
  formData: FormData | z.infer<typeof noteFormSchema>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    // Verify the note exists and belongs to the user
    const [existingNote] = await db
      .select()
      .from(noteSchema)
      .where(
        and(
          eq(noteSchema.id, id),
          eq(noteSchema.userId, session.user.id),
          eq(noteSchema.isDeleted, false)
        )
      );

    if (!existingNote) {
      return { error: "Note not found" };
    }

    // Handle both FormData and plain objects
    const values = formData instanceof FormData
      ? {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          category: formData.get("category") as any,
        }
      : formData;

    const validationResult = noteFormSchema.safeParse(values);
    if (!validationResult.success) {
      return { error: "Invalid form data", details: validationResult.error.format() };
    }

    const { title, content, category } = validationResult.data;

    const [updatedNote] = await db
      .update(noteSchema)
      .set({
        title,
        content,
        category,
        lastEditedAt: new Date(),
      })
      .where(
        and(
          eq(noteSchema.id, id),
          eq(noteSchema.userId, session.user.id),
          eq(noteSchema.isDeleted, false)
        )
      )
      .returning();

    revalidatePath(`/notes/${id}`);
    revalidatePath("/notes");
    revalidatePath("/dashboard");
    
    return { note: updatedNote };
  } catch (error) {
    console.error("Error updating note:", error);
    return { error: "Failed to update note" };
  }
}

// Delete a note (soft delete)
export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    // Soft delete by setting isDeleted flag
    await db
      .update(noteSchema)
      .set({
        isDeleted: true,
        lastEditedAt: new Date(),
      })
      .where(
        and(
          eq(noteSchema.id, id),
          eq(noteSchema.userId, session.user.id)
        )
      );

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting note:", error);
    return { error: "Failed to delete note" };
  }
} 