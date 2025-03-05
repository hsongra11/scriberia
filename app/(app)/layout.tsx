import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MobileMenu } from '@/components/ui/mobile-menu';

import { auth } from '../(auth)/auth';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar user={session?.user} />
      </div>
      
      <SidebarInset className="bg-background">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile header with menu */}
          <div className="md:hidden flex items-center p-4 border-b">
            <MobileMenu />
            <h1 className="text-xl font-semibold mx-auto">HyperScribe</h1>
          </div>
          
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 