import type { Metadata } from 'next';
import { CraftsmanScreen } from '@/components/services/craftsman/CraftsmanScreen';

export const metadata: Metadata = {
  title: 'Usta & Tamirat — LifeOS',
  description: 'LifeOS Güvenilir ve Doğrulanmış Usta & Ev Bakım Hizmetleri',
};

export default function CraftsmanPage() {
  return <CraftsmanScreen />;
}
