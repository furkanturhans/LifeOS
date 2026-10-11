import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { MobileProvider } from '@/components/providers/MobileProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { LayoutSyncProvider } from '@/components/providers/LayoutSyncProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s — LifeOS',
    default: 'LifeOS',
  },
  description: 'Kişisel dijital yaşam alanın',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeOS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7fa' },
    { media: '(prefers-color-scheme: dark)', color: '#060c1a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="h-full font-sans antialiased no-select overflow-hidden">
        <ThemeProvider>
          <MobileProvider>
            <LocaleProvider>
              <LayoutSyncProvider>{children}</LayoutSyncProvider>
            </LocaleProvider>
          </MobileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
