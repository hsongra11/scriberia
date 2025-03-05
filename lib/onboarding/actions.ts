import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db";
import { user as userSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type UserPreferences = {
  categories: string[];
  theme?: "light" | "dark" | "system";
  defaultView?: "list" | "grid";
  hasCompletedOnboarding: boolean;
};

export async function saveUserPreferences(preferences: UserPreferences) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Store preferences as JSON in the user's metadata field
    await db
      .update(userSchema)
      .set({
        metadata: JSON.stringify({
          preferences,
          updatedAt: new Date().toISOString(),
        }),
      })
      .where(eq(userSchema.id, session.user.id));

    // Revalidate paths that might display user preferences
    revalidatePath("/dashboard");
    revalidatePath("/notes");
    revalidatePath("/templates");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    if (!db) {
      throw new Error("Database connection not available");
    }

    // Get user with metadata
    const [user] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, session.user.id));

    if (!user || !user.metadata) {
      return null;
    }

    // Parse metadata JSON
    try {
      const metadata = JSON.parse(user.metadata as string);
      return metadata.preferences || null;
    } catch (e) {
      console.error("Error parsing user metadata:", e);
      return null;
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
    return null;
  }
}

export async function completeOnboarding() {
  try {
    const preferences = await getUserPreferences();
    
    // Update preferences to mark onboarding as completed
    await saveUserPreferences({
      ...preferences || { categories: ["custom", "brain-dump", "journal", "to-do", "mood-tracking"] },
      hasCompletedOnboarding: true,
    });

    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const preferences = await getUserPreferences();
  return !!preferences?.hasCompletedOnboarding;
} 