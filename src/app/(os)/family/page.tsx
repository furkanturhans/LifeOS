import type { Metadata } from 'next';
import { FamilyScreen } from '@/components/family/FamilyScreen';

export const metadata: Metadata = {
  title: 'Aile — LifeOS',
  description: 'LifeOS Aile Alanı — Aile bağlarını güçlendir',
};

export default function FamilyPage() {
  return <FamilyScreen />;
}
