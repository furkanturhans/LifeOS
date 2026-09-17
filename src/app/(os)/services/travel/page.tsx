import type { Metadata } from 'next';
import { TravelScreen } from '@/components/services/travel/TravelScreen';

export const metadata: Metadata = {
  title: 'Seyahat Merkezi — LifeOS',
  description: 'LifeOS Şehirlerarası Otobüs Sefer Arama ve Seyahat Platformu',
};

export default function TravelPage() {
  return <TravelScreen />;
}
