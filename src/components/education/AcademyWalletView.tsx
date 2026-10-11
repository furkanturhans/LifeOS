'use client';
import { useEffect, useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useAuthStore } from '@/stores/useAuthStore';
import { purchaseQuote, CREDIT_UNIT_KURUS } from '@/lib/education/academy-rules';
import Link from 'next/link';

type Charge = {id:string;studentId:string;grossMilli:number;teacherMilli:number;commissionMilli:number;classroom:{title:string}};
type Purchase = {id:string;credits:number;totalKurus:number;status:string};
type Entry = {id:string;kind:string;amountMilli:number;createdAt:string};
export function AcademyWalletView() {
  const l=useLocaleRender();const {t,locale}=useTranslation();const user=useAuthStore(state=>state.user);
  const [data,setData]=useState<{userId:string;balanceMilli:number;charges:Charge[];purchases:Purchase[];entries:Entry[]}|null>(null);
  const [returnTo,setReturnTo]=useState('');
  const [error,setError]=useState(false);const [credits,setCredits]=useState(100);
  useEffect(()=>{let active=true;void fetch('/api/academy?view=wallet').then(async response=>{if(!response.ok)throw new Error();return response.json();}).then(body=>{if(active)setData(body);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[user?.id]);
  useEffect(()=>{const timer=setTimeout(()=>{const target=new URLSearchParams(window.location.search).get('returnTo');if(target&&/^\/(services\/(taxi|moving|craftsman|travel)|courses|education|chat)(\?|$)/.test(target))setReturnTo(target);},0);return()=>clearTimeout(timer);},[]);
  const valid=Number.isInteger(credits)&&credits>0&&credits<=100000;
  const quote=valid?purchaseQuote(credits):null;
  const money=(kurus:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'TRY'}).format(kurus/100);
  const number=(value:number)=>new Intl.NumberFormat(locale,{maximumFractionDigits:3}).format(value);
  return <div className="mx-auto max-w-xl space-y-5 p-1">
    <div className="rounded-3xl bg-primary/10 p-5"><Coins className="mb-3 h-7 w-7 text-primary" /><p className="text-3xl font-semibold">{data?number(data.balanceMilli/1000):'—'} <span className="text-sm text-muted-foreground">{l('Kredi')}</span></p></div>
    {error&&<p role="alert" className="rounded-xl bg-muted p-3 text-sm">{l('Bağlantı hatası')}</p>}
    {!data&&!error&&<div role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{t.common.loading}</div>}
    <label className="block space-y-2"><span className="text-sm font-medium">{l('Kredi Satın Al')}</span><input aria-label={l('Kredi')} type="number" min={1} max={100000} value={credits} onChange={event=>setCredits(Number(event.target.value))} className="min-h-12 w-full rounded-xl border border-border bg-muted/30 px-3 text-base" /></label>
    {quote&&<div className="space-y-3 rounded-2xl border border-border p-4 text-sm"><Row label={`${quote.credits} ${l('Kredi')} × ${money(CREDIT_UNIT_KURUS)}`} value={money(quote.baseKurus)}/><Row label={`${l('Komisyon')} · %10`} value={money(quote.commissionKurus)}/><Row label={l('Toplam')} value={money(quote.totalKurus)}/></div>}
    <button disabled className="min-h-12 w-full rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground opacity-40">{l('Kredi Satın Al')} · {l('Yakında')}</button>
    {returnTo&&<Link href={returnTo} className="flex min-h-12 items-center justify-center rounded-xl bg-muted text-sm">{t.common.back}</Link>}
    {!!data?.entries?.length&&<section className="space-y-3"><h3 className="text-sm font-semibold">{l('İşlem Geçmişi')}</h3>{data.entries.map(entry=><div key={entry.id} className="rounded-xl border border-border p-4"><Row label={l(entry.kind==='service-access'?'Teklif Ücreti':entry.kind==='taxi-pass'?'Taksi':entry.kind==='purchase'?'Kredi Satın Al':entry.kind==='class-income'?'Ders Geliri':'Dersler')} value={`${entry.amountMilli>=0?'+':''}${number(entry.amountMilli/1000)} ${l('Kredi')}`}/><p className="mt-1 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString(locale)}</p></div>)}</section>}
    {!!data?.charges.length&&<section className="space-y-3"><h3 className="text-sm font-semibold">{l('Dersler')}</h3>{data.charges.map(item=><div key={item.id} className="rounded-xl border border-border p-4"><Row label={item.classroom.title} value={`${item.studentId===data.userId?'−':'+'}${number((item.studentId===data.userId?item.grossMilli:item.teacherMilli)/1000)} ${l('Kredi')}`}/>{item.studentId!==data.userId&&<p className="mt-2 text-xs text-muted-foreground">{l('Komisyon')} · {number(item.commissionMilli/1000)} {l('Kredi')}</p>}</div>)}</section>}
    {!!data?.purchases.length&&<section className="space-y-3">{data.purchases.map(item=><div key={item.id} className="rounded-xl border border-border p-4"><Row label={`${item.credits} ${l('Kredi')}`} value={money(item.totalKurus)}/><p className="mt-2 text-xs text-muted-foreground">{item.status==='paid'?t.common.done:l('Bekliyor')}</p></div>)}</section>}
  </div>;
}
function Row({label,value}:{label:string;value:string}){return <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>;}
