import { z } from 'zod';

export const categorySchema = z.enum(['game', 'education', 'story', 'drawing']);
const bundledAsset = z.string().max(300).regex(/^\/kids\/[a-zA-Z0-9/_-]+\.(svg|png|jpg|jpeg|webp|html)$/).refine(value => !value.includes('..'));
const localAsset = z.union([bundledAsset, z.string().regex(/^\/api\/kids\/assets\/[a-f0-9-]{36}\.(svg|png|jpg|webp)$/)]);
export const contentSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,100}$/),
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(1200).default(''),
  category: categorySchema,
  ageMin: z.number().int().min(0).max(7), ageMax: z.number().int().min(0).max(7),
  locale: z.string().regex(/^[a-z]{2}$/).default('tr'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  image: localAsset.nullable().optional(), gameUrl: z.union([localAsset, z.string().regex(/^\/api\/kids\/play\/[a-f0-9-]{36}$/)]).optional(),
  subject: z.enum(['letters', 'numbers', 'science', 'nature', 'shapes']).optional(),
  tracing: z.boolean().optional(),
  pages: z.array(z.object({ text: z.string().trim().min(1).max(2000), image: localAsset.nullable().optional() }).strict()).min(1).max(40).optional(),
  cards: z.array(z.object({ label: z.string().trim().min(1).max(140), visual: z.string().max(100), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), narration: z.string().trim().min(1).max(1000) }).strict()).min(1).max(20).optional(),
  license: z.enum(['MIT', 'Apache 2.0', 'CC0', 'CC BY 3.0', 'CC BY 4.0', 'LifeOS original']),
  licenseUrl: z.string().url().max(300).optional(),
  author: z.string().trim().min(1).max(500), illustrator: z.string().max(500).optional(), translator: z.string().max(500).optional(),
  source: z.string().max(500).refine(value => value === 'LifeOS' || /^https:\/\//.test(value)), sourceCommit: z.string().regex(/^[a-f0-9]{40}$/).optional(),
  reviewed: z.boolean().default(false), reviewNote: z.string().max(2000).default(''),
}).strict().superRefine((item, context) => {
  const issue = (message: string) => context.addIssue({ code: 'custom', message });
  if (item.ageMax < item.ageMin) issue('Yaş aralığı geçersiz.');
  if (item.category === 'game' && !item.gameUrl) issue('Oyun dosyası gerekli.');
  if (item.category === 'education' && (!item.cards?.length || !item.subject)) issue('Eğitim kartları ve konusu gerekli.');
  if (item.category === 'story' && !item.pages?.length) issue('Hikâye sayfaları gerekli.');
  if (item.category === 'drawing' && !item.image) issue('Çizim dosyası gerekli.');
  if (item.status === 'published' && (!item.reviewed || !item.reviewNote.trim())) issue('Yayınlamak için içerik incelemesi ve inceleme notu gerekli.');
  if (item.license.startsWith('CC BY') && (!item.licenseUrl || !item.illustrator)) issue('CC BY içerik için lisans bağlantısı ve çizer künyesi gerekli.');
});
export type KidsContent = z.infer<typeof contentSchema>;
export const proposalSchema = z.object({
  category: z.enum(['game', 'education', 'story', 'drawing', 'video']),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(20).max(3000),
  source: z.string().url().max(500).refine(value => value.startsWith('https://')),
  licenseNote: z.string().trim().min(5).max(1000),
  guardianConsent: z.literal(true),
}).strict();
export const contestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,100}$/), title: z.string().trim().min(3).max(140),
  prompt: z.string().trim().min(20).max(2000), prize: z.string().trim().min(2).max(300),
  ageMin: z.number().int().min(3).max(7), ageMax: z.number().int().min(3).max(7),
  deadline: z.string().datetime(), status: z.enum(['draft', 'open', 'closed']),
  rules: z.string().trim().min(30).max(4000),
}).strict().refine(value => value.ageMax >= value.ageMin);
export type KidsContest = z.infer<typeof contestSchema>;
