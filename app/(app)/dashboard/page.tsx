import Link from "next/link";

import { Button } from "@/components/ui/button";
import { auth } from "../../(auth)/auth";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col flex-1 w-full h-full p-4 md:p-8 overflow-auto">
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to HyperScribe, {user?.name || "there"}
          </h1>
          <p className="text-muted-foreground">
            Organize your thoughts, tasks, and ideas in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Button asChild className="justify-start" variant="outline">
                <Link href="/notes/new">
                  <span>Create New Note</span>
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/notes">
                  <span>View All Notes</span>
                </Link>
              </Button>
              <Button asChild className="justify-start" variant="outline">
                <Link href="/templates">
                  <span>Browse Templates</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Recent Notes</h2>
            {/* Placeholder for recent notes list */}
            <p className="text-muted-foreground">
              Your recent notes will appear here once you start creating them.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            {/* Placeholder for tasks */}
            <p className="text-muted-foreground">
              Your tasks will appear here once you start creating them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 