import type { Metadata } from 'next';
import { ServicePlatform } from '@/components/platform/ServicePlatform';

export const metadata: Metadata = {
  title: 'Taksi — LifeOS',
  description: 'LifeOS Güvenli ve Sabit Fiyatlı Taksi Çağırma Sistemi',
};

export default function TaxiPage() {
  return <ServicePlatform kind="taxi" />;
}
