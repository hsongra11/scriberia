import { notFound } from "next/navigation";
import { getShareLinkByToken } from "@/lib/sharing/generate-link";
import { db } from "@/lib/db";
import { note as noteSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NoteContent } from "@/components/notes/note-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SharedNotePageProps {
  params: {
    token: string;
  };
}

export default async function SharedNotePage({ params }: SharedNotePageProps) {
  const { token } = params;
  
  // Get the share link from the database
  const shareLink = await getShareLinkByToken(token);
  
  if (!shareLink || !shareLink.isActive || (shareLink.expiresAt && new Date() > shareLink.expiresAt)) {
    notFound();
  }
  
  // Get the note from the database
  if (!db) {
    throw new Error("Database connection not available");
  }
  
  const noteData = await db
    .select()
    .from(noteSchema)
    .where(eq(noteSchema.id, shareLink.noteId))
    .then(rows => rows[0]);
  
  if (!noteData) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">{noteData.title || "Untitled Note"}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Shared on {format(shareLink.createdAt, "MMMM d, yyyy")}
            {shareLink.expiresAt && (
              <> · Expires on {format(shareLink.expiresAt, "MMMM d, yyyy")}</>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <NoteContent 
            note={noteData} 
            content={noteData.content || ""} 
            onContentChange={() => {}} 
            isEditing={false}
            className="min-h-[50vh]"
          />
        </CardContent>
      </Card>
    </div>
  );
} 