import type { Metadata } from 'next';
import { ServicesScreen } from '@/components/services/ServicesScreen';

export const metadata: Metadata = {
  title: 'Hizmetler — LifeOS',
  description: 'LifeOS Hizmetler Merkezi — Taksi, Seyahat, Nakliye ve Usta Hizmetleri',
};

export default function ServicesPage() {
  return <ServicesScreen />;
}
