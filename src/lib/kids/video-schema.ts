import { z } from 'zod';

export const videoProviders = ['commons', 'nasa', 'pexels', 'pixabay', 'manual'] as const;
export const videoTopics = ['animals', 'nature', 'science', 'space', 'colors', 'numbers', 'language', 'creativity'] as const;
const language = z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/);
const https = z.string().url().max(2000).refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}, 'HTTPS adresi gerekli.');
const mediaSource = z.object({ url: https, mime: z.enum(['video/mp4', 'video/webm', 'video/quicktime']) }).strict();
export const videoSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,120}$/),
  provider: z.enum(videoProviders), providerId: z.string().max(300),
  title: z.string().trim().min(2).max(240), description: z.string().max(4000),
  translations: z.record(language, z.object({ title: z.string().min(2).max(240), description: z.string().max(4000) }).strict()).default({}),
  topic: z.enum(videoTopics), ageMin: z.number().int().min(3).max(7), ageMax: z.number().int().min(3).max(7),
  durationSeconds: z.number().min(0).max(600),
  sources: z.array(mediaSource).min(1).max(6),
  mediaVariants: z.record(language, z.object({ sources:z.array(mediaSource).min(1).max(6), audioLanguages:z.array(language).max(30) }).strict()).default({}),
  poster: https.optional(), audioLanguages: z.array(language).max(30).default([]),
  captions: z.array(z.object({ language, label: z.string().max(80), url: https }).strict()).max(30).default([]),
  license: z.enum(['CC0', 'Public domain', 'CC BY 3.0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'NASA media guidelines', 'Pexels License', 'Pixabay Content License', 'LifeOS original']),
  licenseUrl: https, sourceUrl: https, creator: z.string().min(1).max(1000),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  reviewed: z.boolean().default(false), reviewNote: z.string().max(3000).default(''),
  languageChecked: z.boolean().default(false),
}).strict().superRefine((item, context) => {
  if (item.status === 'published' && item.durationSeconds <= 0) context.addIssue({ code:'custom', message:'Yayın için gerçek süreyi doğrulayın.' });
  if (item.ageMax < item.ageMin) context.addIssue({ code:'custom', message:'Yaş aralığı geçersiz.' });
  if (item.status === 'published' && (!item.reviewed || !item.languageChecked || !item.reviewNote.trim())) context.addIssue({ code:'custom', message:'Yayın için video, lisans, yaş ve dil incelemesini tamamlayın.' });
});
export type KidsVideo = z.infer<typeof videoSchema>;

export function videoMedia(video: KidsVideo, locale: string) {
  return video.mediaVariants[locale] ?? video.mediaVariants[locale.split('-')[0]] ?? { sources:video.sources, audioLanguages:video.audioLanguages };
}

export function videoText(video: KidsVideo, locale: string) {
  return video.translations[locale] ?? video.translations[locale.split('-')[0]] ?? { title: video.title, description: video.description };
}
