import type { Metadata } from 'next';
import { Dock } from '@/components/os/Dock';

export const metadata: Metadata = {
  title: 'LifeOS',
};

export default function OSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full min-h-svh overflow-hidden">
      <main className="h-full">{children}</main>
    </div>
  );
}
