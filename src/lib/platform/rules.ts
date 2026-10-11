export const PROFESSIONS = {
  moving: ['home', 'partial', 'office', 'intercity'],
  craftsman: ['electrical', 'plumbing', 'painting', 'furniture', 'heating', 'cleaning', 'other'],
  taxi: ['driver'],
  teacher: ['teacher', 'educator'],
  travel: ['bus'],
} as const;
export type Profession = keyof typeof PROFESSIONS;
export const SERVICE_FEE_MILLI = 10_000;
export const TAXI_PASS_MILLI = 100_000;
export function coordinates(latitude:unknown,longitude:unknown) {
  if(typeof latitude!=='number'||typeof longitude!=='number'||!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude< -90||latitude>90||longitude< -180||longitude>180)throw new Error('INVALID_LOCATION');
  return {latitude,longitude};
}
export function distanceKm(a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}) {
  const radians=(degrees:number)=>degrees*Math.PI/180;
  const value=Math.sin(radians(b.latitude-a.latitude)/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(radians(b.longitude-a.longitude)/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(value),Math.sqrt(Math.max(0,1-value)));
}
export function validSpecialty(profession: string, specialty: string) {
  return Object.hasOwn(PROFESSIONS, profession) && (PROFESSIONS[profession as Profession] as readonly string[]).includes(specialty);
}
// Treat contact identifiers as private data, including obfuscated digits and Lifechat handles.
export function containsContact(text: string) {
  const normalized = text.normalize('NFKC').replace(/\p{Cf}/gu,'').replace(/[٠-٩۰-۹]/g, c => String(c.charCodeAt(0) >= 0x6f0 ? c.charCodeAt(0)-0x6f0 : c.charCodeAt(0)-0x660));
  return /(?:https?:\/\/|www\.|wa\.me|t\.me|lifechat|whatsapp|telegram|\S+@\S+|@[\p{L}\d_]{3,})/iu.test(normalized)
    || /(?:\+?\d[\s().\-]*){7,}/u.test(normalized)
    || /(?:(?:sıfır|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz)[\s,.-]+){6,}/iu.test(normalized);
}
export function travelSplit(totalKurus: number) {
  if (!Number.isSafeInteger(totalKurus) || totalKurus < 1 || totalKurus > 100_000_000) throw new Error('INVALID_AMOUNT');
  const commissionKurus = Math.round(totalKurus * 8 / 100);
  return { totalKurus, commissionKurus, companyKurus: totalKurus - commissionKurus };
}
