import type { Metadata } from 'next';
import { ServicePlatform } from '@/components/platform/ServicePlatform';

export const metadata: Metadata = {
  title: 'Nakliye & Taşıma — LifeOS',
  description: 'LifeOS Güvenli Nakliye ve Akıllı Teklif Sistemi',
};

export default function MovingPage() {
  return <ServicePlatform kind="moving" />;
}
