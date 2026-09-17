import { ConnectScreen } from '@/components/connect/ConnectScreen';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeOS Connect | Mesajlaşma ve İletişim Merkezi',
  description: 'LifeOS güvenli, sakin ve bağlam odaklı iletişim merkezi.',
};

export default function ConnectPage() {
  return <ConnectScreen />;
}
