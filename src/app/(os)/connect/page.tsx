import { LifechatHub } from '@/components/platform/LifechatHub';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lifechat | Mesajlaşma ve İletişim Merkezi',
  description: 'LifeOS güvenli, sakin ve bağlam odaklı iletişim merkezi.',
};

export default function ConnectPage() {
  return <LifechatHub />;
}
