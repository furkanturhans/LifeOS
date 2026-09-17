import type { Metadata } from 'next';
import { TaxiScreen } from '@/components/services/taxi/TaxiScreen';

export const metadata: Metadata = {
  title: 'Taksi — LifeOS',
  description: 'LifeOS Güvenli ve Sabit Fiyatlı Taksi Çağırma Sistemi',
};

export default function TaxiPage() {
  return <TaxiScreen />;
}
