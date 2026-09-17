import type { Metadata } from 'next';
import { NotificationScreen } from '@/components/notifications/NotificationScreen';

export const metadata: Metadata = {
  title: 'Bildirim Merkezi — LifeOS',
  description: 'LifeOS Bildirim ve Uyarı Merkezi',
};

export default function NotificationsPage() {
  return <NotificationScreen />;
}
