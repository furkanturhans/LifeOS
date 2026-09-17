import type { Metadata } from 'next';
import { SmartHomeScreen } from '@/components/smarthome/SmartHomeScreen';

export const metadata: Metadata = {
  title: 'Akıllı Ev — LifeOS',
  description: 'LifeOS Akıllı Ev Kontrol Merkezi — Home Assistant & Matter Entegrasyonu',
};

export default function SmartHomePage() {
  return <SmartHomeScreen />;
}
