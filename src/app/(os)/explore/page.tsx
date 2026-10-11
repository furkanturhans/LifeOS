import type { Metadata } from 'next';
import { ExploreScreen } from '@/components/explore/ExploreFeed';

export const metadata: Metadata = {
  title: 'Nodes — LifeOS',
  description: 'LifeOS Nodes — Topluluk ve sosyal akış alanı',
};

export default function ExplorePage() {
  return <ExploreScreen />;
}
