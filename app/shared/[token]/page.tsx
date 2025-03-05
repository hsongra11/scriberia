import { notFound } from "next/navigation";
import { getShareLinkByToken } from "@/lib/sharing/generate-link";
import { db } from "@/db";
import { notes } from "@/db/schema";
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
  const note = await db.query.notes.findFirst({
    where: eq(notes.id, shareLink.noteId),
  });
  
  if (!note) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">{note.title || "Untitled Note"}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Shared on {format(shareLink.createdAt, "MMMM d, yyyy")}
            {shareLink.expiresAt && (
              <> · Expires on {format(shareLink.expiresAt, "MMMM d, yyyy")}</>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <NoteContent 
            note={note} 
            content={note.content || ""} 
            onContentChange={() => {}} 
            isEditing={false}
            className="min-h-[50vh]"
          />
        </CardContent>
      </Card>
    </div>
  );
} 