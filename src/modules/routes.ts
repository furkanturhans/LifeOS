import { SERVICE_LINKS } from './service-links';

export function moduleHref(id: string) {
  return SERVICE_LINKS[id] ?? (id === 'smart-home' ? '/smarthome' : `/${id}`);
}
