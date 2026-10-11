'use client';
import Link from 'next/link';
import { useLocaleRender } from '@/lib/i18n/runtime';
export const field='min-h-12 w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-base';
export const primary='inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40';
export async function platformRequest(url:string,body?:object) {
  const response=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});
  const data=await response.json();if(!response.ok)throw new Error(data.error??'UNAVAILABLE');return data;
}
export function PlatformError({code,returnTo}:{code:string;returnTo:string}) {
  const l=useLocaleRender();if(!code)return null;
  const messages:Record<string,string>={INVALID_LOCATION:'Konum erişimi gerekli.',PROFESSION_REQUIRED:'Meslek onayı gerekli.',INSUFFICIENT_CREDITS:'Yetersiz Kredi',TAXI_PASS_REQUIRED:'Yetersiz Kredi',CONTACT_IN_DESCRIPTION:'İletişim bilgilerini açıklamaya eklemeyin.',INVALID_DATE:'Geçerli bir tarih seçin.',INVALID_PHONE:'Geçerli bir telefon numarası girin.',CONFLICT:'Tekrar deneyin',REQUEST_CLOSED:'İlan Kapalı',GATEWAY_NOT_CONFIGURED:'Ödeme hizmeti henüz hazır değil.',SIGN_IN:'Giriş Yap',INVALID_TEXT:'Lütfen tüm alanları doldurun.',FILE_TOO_LARGE:'Dosya boyutu çok büyük.',DOCUMENT_REQUIRED:'Belge yükleyin.',INVALID_FILE:'PDF, JPEG veya PNG seçin.'};
  const credit=['INSUFFICIENT_CREDITS','TAXI_PASS_REQUIRED'].includes(code);
  return <div role="alert" className="space-y-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm"><p>{l(messages[code]??'Bağlantı hatası')}</p>{credit&&<Link className={primary} href={`/finance?returnTo=${encodeURIComponent(returnTo)}`}>{l('Kredi Ekle')}</Link>}{code==='PROFESSION_REQUIRED'&&<Link className={primary} href="/profile/professions">{l('Meslek ve Yetkilerim')}</Link>}</div>;
}
export const professionLabels:Record<string,string>={moving:'Nakliyeci',craftsman:'Usta',taxi:'Taksi Sürücüsü',teacher:'Eğitmen',travel:'Seyahat'};
export const specialtyLabels:Record<string,string>={home:'Evden Eve',partial:'Parça Eşya',office:'Ofis',intercity:'Şehirlerarası',electrical:'Elektrik',plumbing:'Su Tesisatı',painting:'Boya Badana',furniture:'Mobilya',heating:'Klima & Kombi',cleaning:'Temizlik',other:'Diğer',driver:'Taksi Sürücüsü',teacher:'Öğretmen',educator:'Eğitimci',bus:'Otobüs'};
