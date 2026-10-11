import type { Metadata } from 'next';
import { ServicePlatform } from '@/components/platform/ServicePlatform';

export const metadata: Metadata = {
  title: 'Usta & Tamirat — LifeOS',
  description: 'LifeOS Güvenilir ve Doğrulanmış Usta & Ev Bakım Hizmetleri',
};

export default function CraftsmanPage() {
  return <ServicePlatform kind="craftsman" />;
}
