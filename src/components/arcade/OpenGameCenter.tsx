'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Info, Pause, Play, RotateCcw, Search, X } from 'lucide-react';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useThemeStore } from '@/stores/useThemeStore';
import { useArcadeStore } from '@/stores/useArcadeStore';
import { OPEN_GAMES, OPEN_GAME_SOURCE, GAME_CONTROLS, GAME_TEXTS, EMPTY_GAME_PREFERENCES, parseGamePreferences, type GamePreferences, type OpenGame } from '@/lib/arcade/open-games';

const STORAGE='lifeos.open-games.v1';
const categories=[['all','Tümü'],['puzzle','Bulmaca'],['reflex','Refleks'],['strategy','Strateji'],['sports','Spor'],['favorites','Favoriler']] as const;

function GamePlayer({game,onBack,onScore}:{game:OpenGame;onBack:()=>void;onScore:(id:string,score:number)=>void}) {
  const t=useLocaleRender();
  const locale=useThemeStore(s=>s.locale);
  const frame=useRef<HTMLIFrameElement>(null);
  const [token,setToken]=useState('');
  const [paused,setPaused]=useState(false);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const [score,setScore]=useState<number|null>(null);
  const [help,setHelp]=useState(false);
  const send=useCallback((type:string,extra:Record<string,unknown>={})=>frame.current?.contentWindow?.postMessage({scope:'lifeos-game',token,type,...extra},'*'),[token]);
  const initialize=useCallback(()=>send('init',{locale,paused,translations:Object.fromEntries(GAME_TEXTS.map(text=>[text,t(text)]))}),[locale,paused,send,t]);
  useEffect(()=>{
    let active=true;
    queueMicrotask(()=>{if(active)setToken(crypto.randomUUID());});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    const listener=(event:MessageEvent)=>{
      if(event.source!==frame.current?.contentWindow||event.data?.scope!=='lifeos-game'||!token||event.data?.token!==token)return;
      if(event.data.type==='boot')initialize();
      if(event.data.type==='ready')setReady(true);
      if(event.data.type==='paused')setPaused(true);
      if(event.data.type==='error'){setFailed(true);setPaused(true);}
      if(event.data.type==='complete'&&typeof event.data.score==='number'&&Number.isFinite(event.data.score)&&event.data.score>=0&&event.data.score<=100){
        setScore(event.data.score);setPaused(true);onScore(game.id,event.data.score);
      }
    };
    window.addEventListener('message',listener);
    return ()=>window.removeEventListener('message',listener);
  },[game.id,initialize,onScore,token]);
  useEffect(()=>{
    send(paused?'pause':'resume');
  },[paused,send]);
  useEffect(()=>{
    if(ready)initialize();
    // Only locale changes retranslate the current game; do not restart its state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[locale]);
  useEffect(()=>{
    const hide=()=>{if(document.hidden){send('pause');setPaused(true);}};
    document.addEventListener('visibilitychange',hide);
    return ()=>document.removeEventListener('visibilitychange',hide);
  },[send]);
  useEffect(()=>{
    if(ready||failed||!token)return;
    const timeout=window.setTimeout(()=>setFailed(true),15000);
    return ()=>window.clearTimeout(timeout);
  },[ready,failed,token]);
  const replay=()=>{setReady(false);setFailed(false);setScore(null);setPaused(false);setToken(crypto.randomUUID());};
  return <section className="flex h-full min-h-0 flex-col bg-background">
    <header className="flex items-center gap-3 border-b border-border px-4 py-3">
      <button onClick={onBack} aria-label={t('Geri')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><ArrowLeft size={21}/></button>
      <h1 className="min-w-0 flex-1 truncate text-base font-bold">{game.emoji} {t(game.title)}</h1>
      <button onClick={()=>{setHelp(v=>!v);setPaused(true);}} aria-label={t('Nasıl Oynanır?')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><Info size={20}/></button>
      <button onClick={replay} aria-label={t('Yeniden Başlat')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><RotateCcw size={20}/></button>
    </header>
    <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
      <div className="mx-auto max-w-xl">
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-muted/50 px-4 py-2">
          <p className="text-sm tracking-wide" dir="ltr">{GAME_CONTROLS[game.id]}</p>
          <button onClick={()=>setPaused(v=>!v)} disabled={score!==null||failed} aria-label={t(paused?'Devam Et':'Duraklat')} className="grid size-11 shrink-0 place-items-center rounded-xl bg-card disabled:opacity-40">{paused?<Play size={19}/>:<Pause size={19}/>}</button>
        </div>
        {help&&<div className="mb-3 rounded-2xl border border-border p-4"><div className="flex items-center justify-between"><strong>{t('Nasıl Oynanır?')}</strong><button onClick={()=>setHelp(false)} aria-label={t('Kapat')} className="grid size-10 place-items-center"><X size={18}/></button></div><p className="mt-2 text-2xl" dir="ltr">{GAME_CONTROLS[game.id]}</p><p className="mt-3 text-sm text-muted-foreground">{t('Dokunmatik kontroller')}</p></div>}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1020] shadow-lg" style={{height:530}}>
          {token&&<iframe ref={frame} key={token} src={`/games/open/index.html?game=${encodeURIComponent(game.id)}#${token}`} sandbox="allow-scripts" title={t(game.title)} onLoad={initialize} className="h-full w-full border-0"/>}
          {!ready&&!failed&&<div className="absolute inset-0 grid place-items-center bg-[#0b1020] text-white"><span className="animate-pulse">{t('Yükleniyor...')}</span></div>}
          {(paused||failed||score!==null)&&<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0b1020]/80 px-6 text-center text-white backdrop-blur-sm">
            <span className="text-4xl">{failed?'🔄':score!==null?'🏆':'⏸'}</span>
            <h2 className="text-xl font-bold">{t(failed?'Oyun yüklenemedi.':score!==null?'Oyun Bitti':'Duraklatıldı')}</h2>
            {score!==null&&<p className="text-3xl font-bold tabular-nums">{new Intl.NumberFormat(locale).format(score)} / 100</p>}
            <button onClick={failed||score!==null?replay:()=>{setHelp(false);setPaused(false);}} className="flex min-h-12 items-center gap-2 rounded-2xl bg-violet-500 px-7 py-3 font-semibold"><Play size={18}/>{t(failed||score!==null?'Tekrar Oyna':'Devam Et')}</button>
          </div>}
        </div>
      </div>
    </div>
  </section>;
}

export function OpenGameCenter(){
  const t=useLocaleRender();
  const [selected,setSelected]=useState<OpenGame|null>(null);
  const [preferences,setPreferences]=useState<GamePreferences>(EMPTY_GAME_PREFERENCES);
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [licenses,setLicenses]=useState(false);
  const setSection=useArcadeStore(s=>s.setActiveSection);
  useEffect(()=>{
    let active=true;
    queueMicrotask(()=>{if(active){try{setPreferences(parseGamePreferences(localStorage.getItem(STORAGE)));}catch{/* Storage can be unavailable in private mode. */}}});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    setSection(selected?'mini_games':null);
    return ()=>setSection(null);
  },[selected,setSection]);
  const update=useCallback((transform:(p:GamePreferences)=>GamePreferences)=>setPreferences(previous=>{
    const next=transform(previous);
    try{localStorage.setItem(STORAGE,JSON.stringify(next));}catch{/* Games remain playable without storage. */}
    return next;
  }),[]);
  const recordScore=useCallback((id:string,score:number)=>update(p=>({...p,best:{...p.best,[id]:Math.max(p.best[id]??0,score)}})),[update]);
  const play=(game:OpenGame)=>{update(p=>({...p,recent:[game.id,...p.recent.filter(id=>id!==game.id)].slice(0,8)}));setSelected(game);};
  const filtered=useMemo(()=>OPEN_GAMES.filter(g=>(category==='all'||(category==='favorites'?preferences.favorites.includes(g.id):category===g.category))&&t(g.title).toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())),[category,preferences.favorites,query,t]);
  const recent=preferences.recent.map(id=>OPEN_GAMES.find(g=>g.id===id)).filter((g):g is OpenGame=>Boolean(g));
  if(selected)return <GamePlayer key={selected.id} game={selected} onBack={()=>setSelected(null)} onScore={recordScore}/>;
  return <div className="h-full overflow-y-auto bg-background pb-24">
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
      <header className="flex items-center gap-3"><Link href="/home" aria-label={t('Ana Ekran')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><ArrowLeft size={21}/></Link><div className="flex-1"><h1 className="text-xl font-bold">{t('Oyun Merkezi')}</h1><p className="mt-1 text-xs text-muted-foreground">20 · {t('Ücretsiz')} · {t('Açık Kaynak')}</p></div><button onClick={()=>setLicenses(true)} aria-label={t('Oyun Lisansı & Bilgi')} className="grid size-11 place-items-center rounded-xl hover:bg-muted"><Info size={20}/></button></header>
      <label className="my-4 flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4"><Search size={19} className="text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Oyunlar içinde ara...')} className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{categories.map(([id,label])=><button key={id} onClick={()=>setCategory(id)} aria-pressed={category===id} className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-semibold ${category===id?'bg-violet-600 text-white':'bg-muted/60 text-muted-foreground'}`}>{t(label)}</button>)}</div>
      {!query&&category==='all'&&recent.length>0&&<section className="mb-5"><h2 className="mb-2 text-sm font-semibold">{t('Son Oynananlar')}</h2><div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{recent.map(g=><button key={g.id} onClick={()=>play(g)} className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl bg-muted/40 p-3"><span className="text-3xl">{g.emoji}</span><span className="w-full truncate text-xs">{t(g.title)}</span></button>)}</div></section>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map((game,index)=><article key={game.id} className="relative overflow-hidden rounded-3xl border border-border bg-card transition hover:border-violet-400/60">
        <button onClick={()=>update(p=>({...p,favorites:p.favorites.includes(game.id)?p.favorites.filter(id=>id!==game.id):[...p.favorites,game.id]}))} aria-label={t(preferences.favorites.includes(game.id)?'Favorilerden Kaldır':'Favorilere Ekle')} aria-pressed={preferences.favorites.includes(game.id)} className="absolute right-1 top-1 z-10 grid size-10 place-items-center rounded-xl"><Heart size={16} className={preferences.favorites.includes(game.id)?'fill-rose-500 text-rose-500':'text-muted-foreground'}/></button>
        <button onClick={()=>play(game)} className="flex h-full min-h-48 w-full flex-col items-center px-3 pb-4 pt-7 text-center"><span className={`mb-4 grid size-16 place-items-center rounded-3xl bg-gradient-to-br text-4xl ${index%3===0?'from-violet-500/20 to-fuchsia-500/10':index%3===1?'from-teal-500/20 to-blue-500/10':'from-amber-500/20 to-rose-500/10'}`}>{game.emoji}</span><span className="text-sm font-semibold leading-snug">{t(game.title)}</span><span className="mt-2 text-[11px] text-muted-foreground">{t(categories.find(([id])=>id===game.category)?.[1]??'Bulmaca')}{preferences.best[game.id]!==undefined?` · ${preferences.best[game.id]}/100`:''}</span><span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-violet-500"><Play size={12}/>{t('Oyna')}</span></button>
      </article>)}</div>
      {filtered.length===0&&<p className="py-12 text-center text-sm text-muted-foreground">{t('Aramanıza uygun oyun bulunamadı.')}</p>}
    </div>
    {licenses&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" onClick={()=>setLicenses(false)}><section role="dialog" aria-modal="true" aria-label={t('Oyun Lisansı & Bilgi')} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between"><h2 className="font-bold">{t('Açık Kaynak')}</h2><button onClick={()=>setLicenses(false)} aria-label={t('Kapat')} className="grid size-11 place-items-center"><X size={20}/></button></div><p className="mt-3 text-sm">Zeli Web Games · Hajun Ho &amp; contributors</p><p className="mt-2 text-sm text-muted-foreground">Apache License 2.0 · LifeOS</p><a href={OPEN_GAME_SOURCE.repository} target="_blank" rel="noreferrer" className="mt-4 block text-sm text-violet-500">GitHub ↗</a><a href="/games/open/LICENSE.txt" target="_blank" rel="noreferrer" className="mt-3 block text-sm text-violet-500">Apache License 2.0 ↗</a><a href="/games/open/NOTICE.txt" target="_blank" rel="noreferrer" className="mt-3 block text-sm text-violet-500">NOTICE ↗</a></section></div>}
  </div>;
}
