import type { Metadata } from 'next';
import { HomeScreen } from '@/components/os/HomeScreen';

export const metadata: Metadata = {
  title: 'LifeOS — Ana Ekran',
};

export default function HomePage() {
  return <HomeScreen />;
}
