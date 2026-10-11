import Image from 'next/image';
import { cn } from '@/lib/utils';

const artwork: Record<string, string> = {
  ai: 'ai-technology-alternate', chat: 'chat', family: 'family',
  medai: 'healthcare', 'smart-home': 'smart-home', smarthome: 'smart-home',
  arcade: 'arcade', courses: 'training', education: 'education', kids: 'playtime',
  explore: 'nodes.svg', store: 'store', cloud: 'security', files: 'folder',
  services: 'customer-service-alternate', emergency: 'emergency-button',
  rewards: 'trophy-alternate', travel: 'travel-bag', craftsman: 'customer-support',
  notifications: 'notification-bell', profile: 'user', study: 'abc-block',
  movie: 'cinema', stories: 'bedtime', mini_games: 'arcade', parent: 'family',
  solar: 'solar-cell', charging: 'charging', exam: 'exam', hotel: '5-stars',
  rental: 'car-rent', transport: 'transportation',
};

/** Decorative artwork: the surrounding control supplies its localized label. */
export function AppArtwork({ id, fallback = '◇', className }: {
  id: string; fallback?: React.ReactNode; className?: string;
}) {
  const asset = artwork[id];
  return (
    <span aria-hidden="true" className={cn('inline-flex h-12 w-12 shrink-0 items-center justify-center', className)}>
      {asset ? <Image src={`/icons/apps/${asset.endsWith('.svg') ? asset : `${asset}.png`}`} alt="" width={64} height={64}
        draggable={false} className="h-full w-full object-contain select-none" /> : fallback}
    </span>
  );
}
