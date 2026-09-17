import type { Metadata } from 'next';
import { ExploreScreen } from '@/components/explore/ExploreScreen';

export const metadata: Metadata = {
  title: 'Keşfet — LifeOS',
  description: 'LifeOS Keşfet — Topluluk ve sosyal akış alanı',
};

export default function ExplorePage() {
  return <ExploreScreen />;
}
