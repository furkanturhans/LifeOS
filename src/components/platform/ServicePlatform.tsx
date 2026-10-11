'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Coins, MessageCircle, Phone, MapPin, ShieldCheck, X } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useTranslation } from '@/lib/i18n';
import { PROFESSIONS } from '@/lib/platform/rules';
import { field, primary, platformRequest, PlatformError, specialtyLabels } from './shared';

type Job={id:string;kind:string;title:string;description:string;region:string;specialty:string;scheduledAt:string;status:string;distanceKm?:number;address?:string;destination?:string;phone?:string;customer?:{displayName:string;lifeosId:string};threadId?:string;unlock?:{offerKurus:number;note:string};drivers?:{legalName:string;vehiclePlate:string;vehicleModel:string}[];location?:{latitude:number;longitude:number};unlocks?:{id:string;provider?:{displayName:string;lifeosId:string};offerKurus?:number;note?:string}[]};
type Data={items:Job[];applications:{specialty:string;legalName:string}[];balanceMilli:number;pass:{expiresAt:string}|null;online:boolean};
type Point={latitude:number;longitude:number};
const names={moving:'Nakliye',craftsman:'Usta',taxi:'Taksi'};
export function ServicePlatform({kind}:{kind:keyof typeof names}) {
  const l=useLocaleRender();const {t,locale}=useTranslation();
  const [data,setData]=useState<Data|null>(null),[view,setView]=useState('market'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[create,setCreate]=useState(false),[chosen,setChosen]=useState<Job|null>(null),[detail,setDetail]=useState<Job|null>(null);
  const [position,setPosition]=useState<Point|null>(null),[tracking,setTracking]=useState(false);
  const key=useRef('');const version=useRef(0);const detailVersion=useRef(0);
  const load=useCallback(async()=>{
    const current=++version.current;setLoading(true);
    try{const response=await platformRequest(`/api/services/platform?kind=${kind}&view=${view}`);if(current===version.current){setData(response);setError('');}}
    catch(err){if(current===version.current)setError((err as Error).message);}finally{if(current===version.current)setLoading(false);}
  },[kind,view]);
  useEffect(()=>{const requests=version;const timer=setTimeout(()=>void load(),0);return()=>{clearTimeout(timer);requests.current++;};},[load]);
  const open=useCallback(async(id:string)=>{
    const current=++detailVersion.current;setBusy(true);setError('');
    try{const response=await platformRequest(`/api/services/platform?kind=${kind}&id=${encodeURIComponent(id)}`);if(current===detailVersion.current)setDetail(response.item);}
    catch(err){if(current===detailVersion.current)setError((err as Error).message);}finally{if(current===detailVersion.current)setBusy(false);}
  },[kind]);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get('request');const timer=setTimeout(()=>{if(id)void open(id);},0);return()=>clearTimeout(timer);},[open]);
  useEffect(()=>{
    if(kind!=='taxi'||!tracking)return;let last=0;
    const watch=navigator.geolocation.watchPosition(result=>{
      if(Date.now()-last<10000)return;last=Date.now();
      void platformRequest('/api/services/platform',{action:'location',online:true,latitude:result.coords.latitude,longitude:result.coords.longitude}).then(()=>load()).catch(err=>setError((err as Error).message));
    },()=>setError('INVALID_LOCATION'),{enableHighAccuracy:true,maximumAge:10000});
    const timer=setInterval(()=>void load(),15000);return()=>{navigator.geolocation.clearWatch(watch);clearInterval(timer);};
  },[kind,tracking,load]);
  useEffect(()=>{if(kind!=='taxi'||!detail||detail.status!=='accepted')return;const timer=setInterval(()=>{if(document.visibilityState==='visible')void open(detail.id);},15000);return()=>clearInterval(timer);},[kind,detail,open]);
  async function mutate(body:object){if(busy)return null;setBusy(true);setError('');try{const response=await platformRequest('/api/services/platform',body);await load();return response;}catch(err){setError((err as Error).message);return null;}finally{setBusy(false);}}
  function locate(callback?:(point:Point)=>void){
    if(!navigator.geolocation){setError('INVALID_LOCATION');return;}
    navigator.geolocation.getCurrentPosition(result=>{const point={latitude:result.coords.latitude,longitude:result.coords.longitude};setPosition(point);callback?.(point);},()=>setError('INVALID_LOCATION'),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
  }
  const money=(kurus:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:'TRY'}).format(kurus/100);
  function select(job:Job){setError('');setCreate(false);if(view==='mine'||job.unlocks?.length)void open(job.id);else{setChosen(job);setDetail(null);}}
  async function createJob(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const values=new FormData(event.currentTarget);const date=new Date(String(values.get('scheduledAt')));
    if(!Number.isFinite(date.getTime())){setError('INVALID_DATE');return;}
    const response=await mutate({action:'create',kind,specialty:values.get('specialty'),title:values.get('title'),description:values.get('description'),region:values.get('region'),address:values.get('address'),destination:values.get('destination'),phone:values.get('phone'),latitude:position?.latitude,longitude:position?.longitude,scheduledAt:date.toISOString()});
    if(response){setCreate(false);setView('mine');}
  }
  async function offer(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!chosen)return;const values=new FormData(event.currentTarget);const id=chosen.id;
    const response=await mutate({action:'unlock',id,offerKurus:Math.round(Number(values.get('offer'))*100),note:values.get('note')});if(response){setChosen(null);await open(id);}
  }
  return <div className="flex h-full flex-col bg-background">
    <header className="flex shrink-0 items-center gap-3 border-b border-border/50 p-4"><Link href="/services" aria-label={t.common.back} className="grid h-11 w-11 place-items-center rounded-xl bg-muted"><ArrowLeft className="h-5 w-5"/></Link><h1 className="flex-1 text-lg font-semibold">{l(names[kind])}</h1><Link href={`/finance?returnTo=${encodeURIComponent(`/services/${kind}`)}`} className="flex min-h-11 items-center gap-2 rounded-full bg-primary/10 px-3 text-primary"><Coins className="h-4 w-4"/>{data?data.balanceMilli/1000:'—'}</Link></header>
    <main className="flex-1 overflow-y-auto px-4 pb-32"><div className="mx-auto max-w-3xl space-y-5 py-5">
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted/40 p-1">{['market','mine','unlocked'].map(value=><button key={value} aria-pressed={view===value} onClick={()=>{setView(value);setDetail(null);setChosen(null);setError('');}} className={`min-h-12 rounded-xl text-xs ${view===value?'bg-card shadow-sm':''}`}>{l(value==='market'?'İş Fırsatları':value==='mine'?'Taleplerim':'İşlerim')}</button>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/profile/professions" className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4"/>{l('Meslek ve Yetkilerim')}</Link><button onClick={()=>{setCreate(!create);setDetail(null);setChosen(null);setError('');}} className={primary}><Plus className="h-4 w-4"/>{l('Talep Oluştur')}</button></div>
      {kind==='taxi'&&<section className="space-y-3 rounded-2xl bg-primary/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">100 {l('Kredi')} · 24 {l('Saat')}</p><p className="mt-1 text-xs text-muted-foreground">{data?.pass?`${l('Bitiş')}: ${new Date(data.pass.expiresAt).toLocaleString(locale)}`:l('Sürücü')}</p></div><button disabled={busy||Boolean(data?.pass)} onClick={()=>{key.current=key.current||crypto.randomUUID();void mutate({action:'taxi-pass',key:key.current});}} className={primary}>{data?.pass?l('Aktif'):l('Başlat')}</button></div><div className="flex flex-wrap gap-3"><button onClick={()=>locate()} className="min-h-11 rounded-xl bg-muted px-4 text-sm">{l('Konumumu Kullan')}{position&&' ✓'}</button><button disabled={busy||!data?.pass} className={primary} onClick={async()=>{if(tracking){const response=await mutate({action:'location',online:false});if(response)setTracking(false);}else locate(async point=>{const response=await mutate({action:'location',online:true,...point});if(response)setTracking(true);});}}>{l(tracking?'Çevrimdışı Ol':'Çevrimiçi Ol')}</button></div></section>}
      <PlatformError code={error} returnTo={`/services/${kind}`}/>{error&&<button onClick={()=>void load()} className="min-h-11 text-sm text-primary">{l('Tekrar deneyin')}</button>}
      {create&&<form className="space-y-3 rounded-3xl border border-border p-5" onSubmit={event=>void createJob(event)}>
        <Label text={l('Kategori')}><select name="specialty" className={field}>{PROFESSIONS[kind].map(value=><option key={value} value={value}>{l(specialtyLabels[value])}</option>)}</select></Label>
        <Label text={l('Başlık')}><input name="title" maxLength={120} required className={field}/></Label><Label text={l('Açıklama')}><textarea name="description" required maxLength={4000} rows={4} className={field}/></Label><p className="text-xs text-muted-foreground">{l('İletişim bilgilerini açıklamaya eklemeyin.')}</p>
        <Label text={l('İl / İlçe')}><input name="region" maxLength={120} required className={field}/></Label><Label text={l('Adres')}><textarea name="address" maxLength={500} required className={field}/></Label>{kind!=='craftsman'&&<Label text={l('Nereye')}><textarea name="destination" maxLength={500} required className={field}/></Label>}
        <Label text={`${l('Telefon')} · ${l('İsteğe bağlı')}`}><input name="phone" type="tel" maxLength={30} className={field}/></Label><Label text={l('Tarih ve Saat')}><input name="scheduledAt" type="datetime-local" required className={field}/></Label><button disabled={busy||(kind==='taxi'&&!position)} className={`${primary} w-full`}>{busy?t.common.loading:l('Yayınla')}</button>
      </form>}
      {chosen&&<form className="space-y-4 rounded-3xl border border-primary/30 p-5" onSubmit={event=>void offer(event)}><div className="flex items-center justify-between"><h2 className="font-semibold">{chosen.title}</h2><button type="button" aria-label={t.common.close} onClick={()=>setChosen(null)} className="grid h-11 w-11 place-items-center"><X className="h-4 w-4"/></button></div><p className="text-sm text-muted-foreground">{chosen.description}</p><p className="text-sm font-medium">{kind==='taxi'?l('Günlük erişim gerekli.'):`10 ${l('Kredi')} · ${l('Teklif Ücreti')}`}</p><Label text={`${l('Teklif')} · TL`}><input name="offer" type="number" min={0} max={1000000} step="0.01" required className={field}/></Label><Label text={l('Mesaj')}><textarea name="note" maxLength={2000} className={field}/></Label><p className="text-xs text-muted-foreground">{l('Ödeme sonrası iletişim bilgileri açılır.')}</p><button disabled={busy} className={`${primary} w-full`}>{busy?t.common.loading:kind==='taxi'?l('Kabul Et'):l('Öde ve Teklif Ver')}</button></form>}
      {detail&&<article className="space-y-4 rounded-3xl border border-border p-5"><div className="flex justify-between gap-3"><h2 className="font-semibold">{detail.title}</h2><button aria-label={t.common.close} className="grid h-11 w-11 place-items-center" onClick={()=>setDetail(null)}><X className="h-4 w-4"/></button></div><p className="whitespace-pre-wrap text-sm">{detail.description}</p>
        {detail.drivers?.map(driver=><div key={driver.vehiclePlate} className="rounded-xl bg-muted p-3 text-sm"><p className="font-medium">{driver.legalName}</p><p>{driver.vehiclePlate} · {driver.vehicleModel}</p></div>)}
        {detail.location&&<a href={`https://www.google.com/maps/search/?api=1&query=${detail.location.latitude},${detail.location.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-primary">{l('Haritada Gör')}</a>}
        {detail.customer&&<Link href={`/chat?thread=${detail.threadId}`} className="inline-flex min-h-11 items-center text-sm font-medium text-primary">{detail.customer.displayName} · @{detail.customer.lifeosId}</Link>}<p className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 shrink-0"/>{detail.address}{detail.destination&&` → ${detail.destination}`}</p>
        <div className="flex flex-wrap gap-3">{detail.threadId&&<Link className={primary} href={`/chat?thread=${detail.threadId}`}><MessageCircle className="h-4 w-4"/>Lifechat</Link>}{detail.phone&&<a href={`tel:${detail.phone.replace(/[^+\d]/g,'')}`} className={`${primary} bg-muted text-foreground`}><Phone className="h-4 w-4"/>{detail.phone}</a>}</div>
        {detail.unlock&&detail.status==='open'&&<form className='space-y-3' onSubmit={async event=>{event.preventDefault();const values=new FormData(event.currentTarget);const response=await mutate({action:'offer',id:detail.id,offerKurus:Math.round(Number(values.get('offer'))*100),note:values.get('note')});if(response)await open(detail.id);}}><Label text={`${l('Teklif')} · TL`}><input name='offer' type='number' min={0} max={1000000} step='0.01' required defaultValue={detail.unlock.offerKurus/100} className={field}/></Label><Label text={l('Mesaj')}><textarea name='note' maxLength={2000} defaultValue={detail.unlock.note} className={field}/></Label><button disabled={busy} className={primary}>{t.common.save}</button></form>}
        {detail.unlocks?.some(unlock=>unlock.provider)&&<><div className="space-y-3">{detail.unlocks.map(unlock=><div key={unlock.id} className="space-y-2 rounded-xl bg-muted/40 p-4"><p className="text-sm font-medium">{unlock.provider?.displayName} · {money(unlock.offerKurus??0)}</p><p className="text-sm">{unlock.note}</p><div className="flex flex-wrap gap-2"><button disabled={busy||detail.status!=='open'} className={primary} onClick={async()=>{const response=await mutate({action:'status',id:detail.id,status:'accepted',unlockId:unlock.id});if(response)await open(detail.id);}}>{l('Kabul Et')}</button><Link className="inline-flex min-h-12 items-center rounded-xl bg-background px-3 text-sm" href={`/chat?service=${unlock.id}`}>Lifechat</Link></div></div>)}</div></>}
        {!detail.customer&&<div className="flex gap-3">{['completed','cancelled'].map(status=><button key={status} disabled={busy||['completed','cancelled'].includes(detail.status)} onClick={async()=>{const response=await mutate({action:'status',id:detail.id,status});if(response)await open(detail.id);}} className="min-h-11 rounded-xl bg-muted px-4 text-sm">{l(status==='completed'?'Tamamlandı':'İptal Et')}</button>)}</div>}
      </article>}
      {loading&&<p role="status" className="text-sm text-muted-foreground">{t.common.loading}</p>}{!loading&&!error&&data!==null&&!data.items.length&&<p className="py-10 text-center text-sm text-muted-foreground">{l('Henüz içerik yok')}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{data?.items.map(job=><button key={job.id} onClick={()=>select(job)} className="space-y-3 rounded-2xl border border-border bg-card p-5 text-start"><div className="flex justify-between gap-2"><span className="text-xs text-primary">{l(specialtyLabels[job.specialty])}</span><span className="text-xs text-muted-foreground">{l(job.status==='open'?'Açık':job.status==='accepted'?'Kabul Edildi':job.status==='completed'?'Tamamlandı':'İptal Edildi')}</span></div><h2 className="font-semibold">{job.title}</h2><p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p><p className="text-xs text-muted-foreground">{job.region}{job.distanceKm!=null&&` · ${job.distanceKm} km`} · {new Date(job.scheduledAt).toLocaleString(locale)}</p><span className="inline-block text-xs font-medium text-primary">{l(job.unlocks?.length||view==='mine'?'Görüntüle':'Teklif Ver')}</span></button>)}</div>
    </div></main>
  </div>;
}
function Label({text,children}:{text:string;children:React.ReactNode}){return <label className="block space-y-1 text-sm"><span>{text}</span>{children}</label>;}
