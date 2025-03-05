import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { noteShare } from '@/lib/db/schema';
import { addDays } from 'date-fns';

export interface ShareLinkOptions {
  noteId: string;
  userId: string;
  expiresInDays?: number;
}

export async function generateShareLink(options: ShareLinkOptions) {
  const { noteId, userId, expiresInDays = 7 } = options;
  
  // Generate a unique token for the share link
  const shareToken = nanoid(10);
  
  // Calculate expiration date
  const expiresAt = expiresInDays > 0 ? addDays(new Date(), expiresInDays) : null;
  
  // Create the share link
  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${shareToken}`;
  
  // Store the share link in the database
  const [createdShare] = await db.insert(noteShare).values({
    noteId,
    shareLink,
    expiresAt,
    isActive: true,
    createdAt: new Date(),
    createdBy: userId,
  }).returning();
  
  return {
    shareLink,
    shareId: createdShare.id,
    expiresAt,
  };
}

export async function deactivateShareLink(shareId: string) {
  await db.update(noteShare)
    .set({ isActive: false })
    .where(({ id }) => id.equals(shareId));
  
  return { success: true };
}

export async function getShareLinkByToken(token: string) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${token}`;
  
  const shares = await db.select()
    .from(noteShare)
    .where(({ shareLink, isActive }) => 
      shareLink.equals(shareUrl).and(isActive.equals(true))
    );
  
  if (!shares.length) {
    return null;
  }
  
  const share = shares[0];
  
  // Check if the share link has expired
  if (share.expiresAt && new Date() > share.expiresAt) {
    // Deactivate expired share link
    await deactivateShareLink(share.id);
    return null;
  }
  
  return share;
} 