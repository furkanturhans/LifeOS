import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeOS — Giriş',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-4 safe-top safe-bottom">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
