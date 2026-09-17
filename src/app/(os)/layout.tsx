import type { Metadata } from 'next';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';

export const metadata: Metadata = {
  title: 'LifeOS',
};

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-svh overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar (lg+) */}
      <DesktopSidebar />

      {/* Main OS Viewport */}
      <main className="relative flex-1 h-full overflow-hidden flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
