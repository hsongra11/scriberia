import React from "react";
import { getNote, getUserTemplates } from "@/lib/notes/actions";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { NoteEditor } from "@/components/notes/note-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface NotePageProps {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Await params before accessing id
  const id = await params.id;
  const isNewNote = id === "new";
  
  // For new notes, redirect to edit page
  if (isNewNote) {
    redirect(`/notes/new/edit`);
  }

  const { note, error } = await getNote(id);
  
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
          <Link href="/notes">
            <ArrowLeft className="mr-2 size-4" />
            Back to Notes
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <NoteEditor 
          note={note} 
          templates={templates}
          isNewNote={false}
        />
      </div>
    </div>
  );
}

export function NotePageSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-4">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        <Skeleton className="h-10 w-3/4 mb-6" />
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
} 