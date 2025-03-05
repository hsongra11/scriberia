import React from "react";
import { getNote, getUserTemplates } from "@/lib/notes/actions";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { NoteEditor } from "@/components/notes/note-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, } from "lucide-react";

type Props = {
  params: { id: string }
}

export default async function NoteEditPage(props: Props) {
  const { params } = props;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const isNewNote = params.id === "new";
  let note = null;
  let error = null;

  // For existing notes, fetch the note
  if (!isNewNote) {
    const result = await getNote(params.id);
    note = result.note;
    error = result.error;
  }

  // Get templates for applying template functionality
  const { templates } = await getUserTemplates();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <h1 className="text-2xl font-bold mb-4">Note not found</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/notes">
            <ArrowLeft className="mr-2 size-4" />
            Back to Notes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href={isNewNote ? "/notes" : `/notes/${params.id}`}>
            <ArrowLeft className="mr-2 size-4" />
            {isNewNote ? "Back to Notes" : "Back to Note"}
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <NoteEditor 
          note={note} 
          templates={templates}
          isNewNote={isNewNote}
        />
      </div>
    </div>
  );
} 