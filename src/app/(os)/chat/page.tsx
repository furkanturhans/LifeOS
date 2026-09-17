import { ConnectScreen } from '@/components/connect/ConnectScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeOS Connect | Mesajlar',
  description: 'LifeOS güvenli, sakin ve bağlam odaklı iletişim merkezi.',
};

export default function ChatPage() {
  return <ConnectScreen />;
}
