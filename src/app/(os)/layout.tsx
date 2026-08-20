import type { Metadata } from 'next';
import { Dock } from '@/components/os/Dock';
import { LayoutSyncProvider } from '@/components/providers/LayoutSyncProvider';

export const metadata: Metadata = {
  title: 'LifeOS',
};

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutSyncProvider>
      <div className="relative h-full min-h-svh overflow-hidden">
        <main className="h-full">{children}</main>
      </div>
    </LayoutSyncProvider>
  );
}
