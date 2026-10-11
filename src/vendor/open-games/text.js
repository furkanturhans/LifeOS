// Locale data comes from the LifeOS host. No network or account data is used.
let translations = {};
export function setGameTranslations(value) {
  translations = value && typeof value === 'object' ? value : {};
}
export function gameText(value) {
  if (typeof value !== 'string') return value;
  if (Object.hasOwn(translations, value)) return translations[value];
  return value.replace(/Kazandın!|Oyun Bitti|Sonraki|Hamle:|Puan:|En iyi:|Berabere|Harika!/g, word => translations[word] || word);
}
