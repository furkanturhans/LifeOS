import manifest from '@/vendor/open-games/manifest.json';

export const OPEN_GAMES = manifest.games;
export type OpenGame = typeof OPEN_GAMES[number];
export const OPEN_GAME_SOURCE = { repository:manifest.repository, commit:manifest.commit, license:manifest.license };
export const GAME_CONTROLS: Record<string,string> = {
  snake:'↑ ↓ ← → · 🍎', breakout:'👆 ↔ · 🧱', runner:'👆 / Space · ⤴', jelly:'👆 / Space · ⤴',
  pong:'👆 ↔ · 🏓', space:'◀ ▶ · 🔫 / Space', '2048':'👆 ↔ ↕ · 2 + 2 = 4', match3:'💎 ↔ 💎 · 3 × 💎',
  mines:'👆 / 🚩 · 💣', slide:'1 2 3 ↔ ⬜', sokoban:'↑ ↓ ← → · 📦 → 🎯', lights:'👆 · 💡 → ⬛',
  colors:'🧪 → 🧪 · 🔴 + 🔴', hanoi:'A → B → C · 🗼', memory:'🃏 + 🃏 · 🐶 = 🐶',
  four:'🔴 🔴 🔴 🔴 · 👤 🔴 / 🤖 🟡', reversi:'⚫ → ⚪ → ⚫ · 👤 ⚫', towers:'🗼 → 🛡 · 💰 1',
  basket:'↗ · ⚡ · 🏀 → 🧺', archery:'👆 🏹 → 🎯 · 💨',
};
export const GAME_TEXTS = ['Oyun Bitti','Kazandın!','Harika!','Başla','Atla','Sonraki','Sonraki (','Puan:','Hamle:','En iyi:','Nasıl Oynanır?','Berabere','Sen','Tamamlandı','Kırmızı','Yeşil','Mavi','Sarı','Easy','Normal','Hard'];

export interface GamePreferences { favorites:string[]; recent:string[]; best:Record<string,number> }
export const EMPTY_GAME_PREFERENCES: GamePreferences = { favorites:[], recent:[], best:{} };
export function parseGamePreferences(raw: string | null): GamePreferences {
  try {
    const value: unknown = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object') return EMPTY_GAME_PREFERENCES;
    const record = value as Record<string,unknown>;
    const ids = new Set(OPEN_GAMES.map(g=>g.id));
    const list = (v:unknown) => Array.isArray(v) ? [...new Set(v.filter((id):id is string=>typeof id==='string'&&ids.has(id)))].slice(0,20) : [];
    const best:Record<string,number>={};
    if(record.best && typeof record.best==='object')for(const [id,score] of Object.entries(record.best))if(ids.has(id)&&typeof score==='number'&&Number.isFinite(score)&&score>=0&&score<=100)best[id]=Math.round(score);
    return { favorites:list(record.favorites), recent:list(record.recent).slice(0,8), best };
  } catch { return EMPTY_GAME_PREFERENCES; }
}
