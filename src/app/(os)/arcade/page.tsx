import type { Metadata } from 'next';
import { ArcadeScreen } from '@/components/arcade/ArcadeScreen';

export const metadata: Metadata = {
  title: 'Arcade — LifeOS',
  description: 'LifeOS Arcade — Oyun ve eğlence merkezi',
};

export default function ArcadePage() {
  return <ArcadeScreen />;
}
