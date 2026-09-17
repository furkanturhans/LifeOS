import type { Metadata } from 'next';
import { KidsHomeScreen } from '@/components/kids/KidsHomeScreen';

export const metadata: Metadata = {
  title: 'LifeOS Kids — Çocuk Dünyası',
  description: 'LifeOS Kids — Eğlenceli, eğitici ve güvenli çocuk alanı',
};

export default function KidsPage() {
  return <KidsHomeScreen />;
}
