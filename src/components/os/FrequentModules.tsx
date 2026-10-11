'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MODULE_REGISTRY, getLocalizedModuleName } from '@/modules/registry';
import { moduleHref } from '@/modules/routes';
import { DEFAULT_WIDGET, useModuleUsageStore } from '@/stores/useModuleUsageStore';
import { useHomescreenStore } from '@/stores/useHomescreenStore';
import { Settings2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from '@/lib/i18n';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { AppArtwork } from '@/components/ui/AppArtwork';

export function ModuleUsageTracker() {
  const pathname = usePathname();
  const account = useAuthStore(state => state.user?.id ?? 'guest');
  const record = useModuleUsageStore(state => state.record);
  const previous = useRef('');
  useEffect(() => {
    const route = pathname === '/connect' ? '/chat' : pathname === '/education' ? '/courses' : pathname;
    const entry = MODULE_REGISTRY.find(item => item.status === 'ACTIVE' &&
      (route === moduleHref(item.id) || route.startsWith(`${moduleHref(item.id)}/`)) &&
      // Prefer the specific service over its parent hub.
      !(item.id === 'services' && pathname !== '/services'));
    const key = `${account}:${entry?.id ?? pathname}`;
    if (previous.current === key) return;
    previous.current = key;
    if (entry) record(account, entry.id);
  }, [pathname, account, record]);
  return null;
}

export function FrequentModules() {
  const account = useAuthStore(state => state.user?.id ?? 'guest');
  const usage = useModuleUsageStore(state => state.accounts[account]);
  const preference = useModuleUsageStore(state => state.widgets[account] ?? DEFAULT_WIDGET);
  const configure = useModuleUsageStore(state => state.configure);
  const isEditMode = useHomescreenStore(state => state.isEditMode);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { locale, t } = useTranslation();
  const localizeText = useLocaleRender();
  const automatic = MODULE_REGISTRY.filter(item => item.status === 'ACTIVE' && usage?.[item.id])
    .sort((a, b) => usage![b.id].count - usage![a.id].count || usage![b.id].lastOpened - usage![a.id].lastOpened)
    .slice(0, 4);
  const available = MODULE_REGISTRY.filter(item => item.status === 'ACTIVE');
  const entries = preference.manual ? preference.pinned.flatMap(id => available.filter(item => item.id === id)) : automatic;
  const editing = settingsOpen || isEditMode;
  if (!editing && (!preference.visible || !entries.length)) return null;
  return <section data-widget className="mx-4 mt-5 p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">{localizeText('Sık kullanılanlar')}</h2>
      <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-muted"
        aria-label={t.common.edit} aria-expanded={editing} onClick={() => setSettingsOpen(!settingsOpen)}>
        <Settings2 className="h-4 w-4" />
      </button>
    </div>
    {editing && <div className="mb-4 space-y-3 border-b border-border pb-4">
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" checked={preference.visible} onChange={event => configure(account, { visible: event.target.checked })} />
        {localizeText('Sık kullanılanlar')}
      </label>
      <div className="flex flex-wrap gap-2">
        {[false, true].map(manual => <button key={String(manual)} type="button" aria-pressed={preference.manual === manual}
          className={`min-h-11 rounded-xl px-4 text-sm ${preference.manual === manual ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => configure(account, { manual })}>{localizeText(manual ? 'Manuel' : 'Otomatik')}</button>)}
      </div>
      {preference.manual && <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-2 text-sm">{t.library.title} · {preference.pinned.length}/4</legend>
        {available.map(item => {
          const selected = preference.pinned.includes(item.id);
          return <label key={item.id} className="flex min-h-11 items-center gap-2 rounded-xl bg-muted/50 p-2 text-xs">
            <input type="checkbox" checked={selected} disabled={!selected && preference.pinned.length >= 4}
              onChange={() => configure(account, { pinned: selected ? preference.pinned.filter(id => id !== item.id) : [...preference.pinned, item.id] })} />
            {getLocalizedModuleName(item, locale)}
          </label>;
        })}
      </fieldset>}
      <button type="button" className="min-h-11 rounded-xl px-4 text-sm text-primary" onClick={() => {
        setSettingsOpen(false); useHomescreenStore.getState().setEditMode(false);
      }}>{t.common.done}</button>
    </div>}
    {preference.visible && <div className="grid grid-cols-4 gap-2">
      {entries.map(item => <Link key={item.id} href={moduleHref(item.id)}
        className="flex min-w-0 flex-col items-center gap-2 rounded-2xl py-2 hover:bg-muted transition-colors">
        <span className="flex aspect-square w-full max-w-20 items-center justify-center rounded-2xl border border-border/60 bg-card p-2.5">
          <AppArtwork id={item.id} fallback={item.icon} className="h-auto w-full max-w-12 aspect-square text-2xl" />
        </span>
        <span className="text-xs text-center font-medium break-words w-full">{getLocalizedModuleName(item, locale)}</span>
      </Link>)}
    </div>}
  </section>;
}
