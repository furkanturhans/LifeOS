import { LIFEOS_CREDIT_RATE_KURUS } from '@/types/payment';
export const CREDIT_UNIT_KURUS = LIFEOS_CREDIT_RATE_KURUS;
export const COMMISSION_PERCENT = 10;
export const MILLI_PER_CREDIT = 1000;

export function purchaseQuote(credits: number) {
  if (!Number.isSafeInteger(credits) || credits < 1 || credits > 100000) throw new Error('INVALID_AMOUNT');
  const baseKurus = credits * CREDIT_UNIT_KURUS;
  const commissionKurus = baseKurus * COMMISSION_PERCENT / 100;
  return { credits, baseKurus, commissionKurus, totalKurus: baseKurus + commissionKurus };
}
export function tuitionSplit(grossMilli: number) {
  if (!Number.isSafeInteger(grossMilli) || grossMilli < 0 || grossMilli > 100000000) throw new Error('INVALID_AMOUNT');
  const commissionMilli = Math.round(grossMilli / 10);
  return { grossMilli, commissionMilli, teacherMilli: grossMilli - commissionMilli };
}
export function accessExpiry(plan: 'daily' | 'monthly', now = new Date()) {
  if (plan === 'monthly') return new Date(now.getTime() + 30 * 86400000);
  // A class day follows Europe/Istanbul (UTC+3), rather than the server's time zone.
  const local = new Date(now.getTime() + 3 * 3600000);
  return new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()+1)-3*3600000);
}
export type AcademyQuestion = { text: string; options: string[]; correct: number };
export function validateQuestions(value: unknown): AcademyQuestion[] {
  if (!Array.isArray(value) || !value.length || value.length > 50) throw new Error('INVALID_EXAM');
  return value.map(question => {
    if (!question || typeof question.text !== 'string' || !question.text.trim() || question.text.length > 2000 ||
      !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6 ||
      !question.options.every((option: unknown) => typeof option === 'string' && option.trim() && option.length <= 500) ||
      !Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.options.length) throw new Error('INVALID_EXAM');
    return { text: question.text.trim(), options: question.options.map((option: string) => option.trim()), correct: question.correct };
  });
}
export function gradeAnswers(questions: AcademyQuestion[], answers: Record<string, number>) {
  return Math.round(100 * questions.filter((question,index) => answers[String(index)] === question.correct).length / questions.length);
}
