import type { Metadata } from 'next';
import { MovingScreen } from '@/components/services/moving/MovingScreen';

export const metadata: Metadata = {
  title: 'Nakliye & Taşıma — LifeOS',
  description: 'LifeOS Güvenli Nakliye ve Akıllı Teklif Sistemi',
};

export default function MovingPage() {
  return <MovingScreen />;
}
