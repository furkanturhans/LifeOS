import type { Metadata } from 'next';
import { OpenGameCenter } from '@/components/arcade/OpenGameCenter';

export const metadata: Metadata = {
  title: 'LifeOS',
  description: 'LifeOS Arcade — Oyun ve eğlence merkezi',
};

export default function ArcadePage() {
  return <OpenGameCenter />;
}
