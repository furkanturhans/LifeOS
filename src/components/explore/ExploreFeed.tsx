'use client';
/* eslint-disable @next/next/no-img-element -- Signed storage URLs and local blob previews are rendered directly. */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Heart, MessageCircle, ImagePlus, X, Loader2, Trash2, Home, Clapperboard, Search, User, Bell } from 'lucide-react';
import { AppArtwork } from '@/components/ui/AppArtwork';
import { useLocaleRender } from '@/lib/i18n/runtime';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from '@/lib/i18n';

type Post = { id: string; text: string; kind: string; mediaType: string | null; mediaUrl: string | null; mediaUnavailable: boolean;
  username: string; displayName: string; own: boolean; liked: boolean; likes: number; comments: number; createdAt: string };
type Comment = { id: string; text: string; username: string };
type Tab = 'feed' | 'shorts' | 'search' | 'profile';
const errors: Record<string,string> = {
  SETUP_REQUIRED: 'Keşfet için sunucu bağlantısı henüz kurulmadı.',
  SIGN_IN: 'Giriş Yap', PROFILE_REQUIRED: 'Profil',
  FILE_TOO_LARGE: '50 MB', INVALID_MEDIA: 'JPG · PNG · WebP · MP4 · WebM',
  VIDEO_REQUIRED: 'MP4 · WebM', EMPTY_POST: 'Ne paylaşmak istersin?',
  RATE_LIMIT: 'Hata',
  UPLOAD_FAILED: 'Bağlantı hatası',
};
async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok) throw new Error(errors[body.error] ?? 'Bağlantı hatası');
  return body;
}

function FeedVideo({ src, short }: { src: string; short: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.65) video.pause();
      else if (short && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) void video.play().catch(() => {});
    }, { threshold: [0,0.65] });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, [src, short]);
  return <video ref={ref} src={src} controls playsInline muted={short} loop={short} preload="metadata"
    className={short ? 'mx-auto aspect-[9/16] max-h-[65dvh] w-full bg-black object-contain' : 'max-h-[65dvh] w-full bg-black object-contain'} />;
}

export function ExploreScreen() {
  const l = useLocaleRender();
  const { t, locale } = useTranslation();
  const user = useAuthStore(state => state.user);
  const [query, setQuery] = useState('');
  const [stories, setStories] = useState<Post[]>([]);
  const [story, setStory] = useState<Post | null>(null);
  const [storyMode, setStoryMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [notices, setNotices] = useState<{id:string;username:string;kind:string}[]>([]);
  const [tab, setTab] = useState<Tab>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [composer, setComposer] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [short, setShort] = useState(false);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [commentPost, setCommentPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const requestId = useRef(0);
  const commentRequest = useRef(0);
  const upload = useRef<HTMLInputElement>(null);
  const load = useCallback(async (after?: string) => {
    const id = ++requestId.current;
    setLoading(true); setError('');
    try {
      const data = await api(`/api/explore/posts?tab=${tab}&q=${encodeURIComponent(tab === "search" ? query : "")}${after ? `&cursor=${encodeURIComponent(after)}` : ''}`);
      if (id !== requestId.current) return;
      setPosts(previous => after ? [...previous, ...data.items.filter((p: Post) => !previous.some(old => old.id === p.id))] : data.items);
      setCursor(data.nextCursor);
    } catch (err) { if (id === requestId.current) setError(err instanceof Error ? err.message : t.common.error); }
    finally { if (id === requestId.current) setLoading(false); }
  }, [tab, query, t.common.error]);
  useEffect(() => {
    const timer = setTimeout(() => { setPosts([]); setCursor(null); void load(); }, 0);
    const requests = requestId;
    return () => { clearTimeout(timer); requests.current++; };
  }, [load, user?.id]);
  useEffect(() => {
    let active = true;
    void api('/api/explore/posts?tab=stories').then(data => { if (active) setStories(data.items); }).catch(() => {});
    return () => { active = false; };
  }, [user?.id, composer]);
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);
  function chooseFile(selected: File | null) {
    setFile(selected); setPreview(selected ? URL.createObjectURL(selected) : '');
  }
  useEffect(() => {
    if (!composer && !commentPost && !story && !notifications) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    function keydown(event: KeyboardEvent) {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!dialog) return;
      if (event.key === 'Escape' && !sending) { setComposer(false); setCommentPost(null); setStory(null); setNotifications(false); }
      if (event.key === 'Tab') {
        const elements = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([type="file"]):not([disabled]), textarea, a[href]'));
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown',keydown);
    return () => { document.removeEventListener('keydown',keydown); previous?.focus(); };
  }, [composer, commentPost, story, notifications, sending]);
  async function publish(event: React.FormEvent) {
    event.preventDefault(); if (sending) return;
    if (!storyMode && short && !file?.type.startsWith('video/')) { setError(l(errors.VIDEO_REQUIRED)); return; }
    setSending(true); setError('');
    try {
      const form = new FormData(); form.set('text',text); form.set('kind',storyMode ? 'story' : short ? 'short' : 'post'); if (file) form.set('file',file);
      await api('/api/explore/posts', { method:'POST',body:form });
      setText(''); chooseFile(null); setComposer(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : t.common.error); }
    finally { setSending(false); }
  }
  async function action(post: Post, body: object) {
    if (pending) return; setPending(post.id); setError('');
    try { await api(`/api/explore/posts/${post.id}`,{ method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body) }); await load(); return true; }
    catch (err) { setError(err instanceof Error ? err.message : t.common.error); return false; }
    finally { setPending(null); }
  }
  async function openComments(id: string) {
    const request = ++commentRequest.current;
    setCommentPost(id); setComments([]); setComment('');
    try { const data = await api(`/api/explore/posts/${id}`); if (request === commentRequest.current) setComments(data.items); }
    catch (err) { setError(err instanceof Error ? err.message : t.common.error); }
  }
  return <div className="flex h-full min-h-0 flex-col bg-background">
    <header className="mx-auto flex w-full max-w-xl shrink-0 items-center justify-between px-3 py-2" style={{paddingTop:'max(8px, env(safe-area-inset-top))'}}>
      <Link href="/home" aria-label={t.common.back} className="grid h-11 w-11 place-items-center"><ArrowLeft className="h-5 w-5 rtl:rotate-180" /></Link>
      <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight"><AppArtwork id="explore" className="h-8 w-8" />Nodes</h1>
      <button aria-label={l('Bildirimler')} onClick={() => { setNotifications(true); setNotices([]); setNoticesLoading(true); setError(''); void api('/api/explore/notifications').then(data => setNotices(data.items)).catch(err => setError(err.message)).finally(() => setNoticesLoading(false)); }} className="grid h-11 w-11 place-items-center"><Bell className="h-5 w-5" /></button>
    </header>
    <main className={`min-h-0 flex-1 overflow-y-auto pb-4 ${tab==='shorts'?'snap-y snap-proximity':''}`}>
      <div className="mx-auto max-w-xl">
        {tab === 'feed' && <section aria-label={l('Hikâyeler')} className="flex h-[98px] gap-4 overflow-x-auto border-b border-border/40 px-4 py-2">
          <button onClick={() => { setStoryMode(true); setShort(false); setComposer(true); }} aria-label={l('Paylaş')} className="flex shrink-0 flex-col items-center gap-1"><span className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-primary/40 bg-primary/5"><Plus className="h-5 w-5 text-primary" /></span><span className="max-w-16 truncate text-[10px]">{user?.lifeosId || 'Nodes'}</span></button>
          {stories.map(item => <button key={item.id} onClick={() => setStory(item)} className="flex shrink-0 flex-col items-center gap-1"><span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 p-0.5"><span className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-background bg-muted">{item.mediaType?.startsWith('image/') && item.mediaUrl ? <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" /> : item.displayName.slice(0,1)}</span></span><span className="max-w-16 truncate text-[10px]">{item.username}</span></button>)}
        </section>}
        {tab === 'search' && <div className="p-4"><label className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4"><Search className="h-5 w-5" /><input autoFocus aria-label={t.nav.search} placeholder={t.nav.search} value={query} onChange={event => setQuery(event.target.value)} maxLength={100} className="min-h-12 min-w-0 flex-1 bg-transparent outline-none" /></label></div>}

        {tab==='profile' && <div className="flex items-center justify-between gap-3 p-5"><div><h2 className="font-semibold">{user?.displayName}</h2><p className="text-sm text-muted-foreground">@{user?.lifeosId}</p></div><Link href="/profile" className="rounded-xl border border-border px-4 py-3 text-sm">{t.common.edit}</Link></div>}
        {error && !composer && <div role="alert" className="m-4 rounded-2xl border border-border bg-muted/40 p-4 text-sm"><p>{l(error)}</p><button onClick={() => void load()} className="mt-2 min-h-11 text-primary">{t.common.retry}</button></div>}
        {!loading && !error && !posts.length && <div className="px-6 py-20 text-center"><ImagePlus className="mx-auto mb-4 h-8 w-8 text-muted-foreground" /><p className="font-medium">{l('Henüz paylaşım yok.')}</p><button onClick={()=>{setStoryMode(false);setShort(tab==='shorts');setComposer(true);}} className="mt-3 min-h-11 text-sm text-primary">{l('Paylaş')}</button></div>}
        {posts.map(post => <article key={post.id} className="snap-start border-b border-border/60 py-4">
          <div className="mb-3 flex items-center gap-3 px-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-semibold">{post.displayName.slice(0,1)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{post.displayName}</p><p className="text-xs text-muted-foreground">@{post.username} · {new Date(post.createdAt).toLocaleDateString(locale)}</p></div>
            {post.own && <button disabled={!!pending} aria-label={l('Kaldır')} onClick={()=>void action(post,{action:'hide'})} className="grid h-11 w-11 place-items-center text-muted-foreground"><Trash2 className="h-4 w-4" /></button>}</div>
          {post.text && <p className="mb-3 whitespace-pre-wrap break-words px-4 text-sm leading-relaxed">{post.text}</p>}
          {post.mediaUrl && (post.mediaType?.startsWith('video/') ? <FeedVideo src={post.mediaUrl} short={tab==='shorts'} /> :  <img src={post.mediaUrl} alt={l('Paylaş')} loading="lazy" className="max-h-[65dvh] w-full object-contain bg-muted/30" />)}
          {post.mediaUnavailable && <p className="p-4 text-sm text-muted-foreground">{l('Bağlantı hatası')}</p>}
          <div className="flex gap-5 px-4 pt-2"><button aria-label={l('Beğen')} aria-pressed={post.liked} disabled={!!pending} onClick={()=>void action(post,{action:'like',value:!post.liked})} className="flex min-h-11 items-center gap-2 text-sm"><Heart className={`h-5 w-5 ${post.liked?'fill-rose-500 text-rose-500':''}`} />{post.likes}</button><button onClick={()=>void openComments(post.id)} className="flex min-h-11 items-center gap-2 text-sm" aria-label={l('Yorumlar')}><MessageCircle className="h-5 w-5" />{post.comments}</button></div>
        </article>)}
        {loading && <div role="status" className="flex justify-center gap-2 p-8 text-sm"><Loader2 className="h-5 w-5 animate-spin" />{t.common.loading}</div>}
        {cursor && !loading && <button onClick={()=>void load(cursor)} className="min-h-12 w-full p-4 text-sm text-primary">{l('Göster')}</button>}
      </div>
    </main>
    <nav aria-label="Nodes" className="shrink-0 border-t border-border/60 bg-background" style={{paddingBottom:'env(safe-area-inset-bottom, 0px)'}}><div className="mx-auto grid max-w-xl grid-cols-5 px-2 py-1">
      {([{id:'feed',icon:Home,label:l('Akış')},{id:'shorts',icon:Clapperboard,label:'Nodes Reel'},{id:'create',icon:Plus,label:l('Paylaş')},{id:'search',icon:Search,label:t.nav.search},{id:'profile',icon:User,label:t.nav.profile}] as const).map(item => <button key={item.id} aria-label={item.label} title={item.label} aria-current={tab === item.id ? 'page' : undefined} onClick={() => { if(item.id === 'create'){setStoryMode(false);setShort(tab === 'shorts');setComposer(true);}else setTab(item.id); }} className={`grid min-h-14 place-items-center rounded-2xl ${tab === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}><item.icon className={item.id === 'create' ? 'h-8 w-8 rounded-xl bg-primary p-1 text-primary-foreground' : 'h-6 w-6'} strokeWidth={tab === item.id ? 2.5 : 1.8} /></button>)}
    </div></nav>
    {story && <div role="dialog" aria-modal="true" aria-label={l('Hikâyeler')} className="fixed inset-0 z-50 flex flex-col bg-black text-white"><div className="flex items-center justify-between p-4"><span>@{story.username}</span><button autoFocus onClick={() => setStory(null)} aria-label={t.common.close} className="grid h-11 w-11 place-items-center"><X /></button></div><div className="flex min-h-0 flex-1 flex-col items-center justify-center">{story.mediaUrl && (story.mediaType?.startsWith('video/') ? <video src={story.mediaUrl} autoPlay controls playsInline className="max-h-[75dvh] w-full object-contain" /> : <img src={story.mediaUrl} alt={story.text} className="max-h-[75dvh] w-full object-contain" />)}<p className="whitespace-pre-wrap break-words p-6 text-center">{story.text}</p></div></div>}
    {notifications && <div role="dialog" aria-modal="true" aria-label={l('Bildirimler')} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"><div className="w-full max-w-lg rounded-3xl bg-card p-5"><div className="flex items-center justify-between"><h2>{l('Bildirimler')}</h2><button autoFocus aria-label={t.common.close} onClick={() => setNotifications(false)} className="grid h-11 w-11 place-items-center"><X /></button></div>{error && <p role="alert" className="py-4 text-sm">{l(error)}</p>}<div className="max-h-[60dvh] overflow-y-auto">{noticesLoading && <p role="status" className="py-6 text-center text-sm">{t.common.loading}</p>}{!noticesLoading && !error && !notices.length && <div className="grid place-items-center py-10"><Bell className="h-8 w-8 text-muted-foreground" /><span className="mt-3 text-sm text-muted-foreground">0</span></div>}{notices.map(item => <div key={item.id} className="flex items-center gap-3 border-b border-border py-4">{item.kind === 'like' ? <Heart className="h-5 w-5 text-rose-500" /> : <MessageCircle className="h-5 w-5 text-primary" />}<span>@{item.username}</span></div>)}</div></div></div>}

    {composer && <div role="dialog" aria-modal="true" aria-label={l('Paylaş')} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
      <form onSubmit={publish} className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{l('Paylaş')}</h2><button type="button" disabled={sending} onClick={()=>setComposer(false)} aria-label={t.common.close} className="grid h-11 w-11 place-items-center"><X className="h-5 w-5" /></button></div>
        <p className="mb-3 text-xs text-muted-foreground">Nodes · {storyMode ? l('Hikâyeler') : l('Paylaş')}</p>
        <textarea autoFocus aria-label={l('Paylaş')} value={text} onChange={event=>setText(event.target.value)} maxLength={2000} rows={4} placeholder={l('Ne paylaşmak istersin?')} className="w-full resize-none rounded-xl bg-muted/40 p-3 text-base" />
        <p className="text-end text-xs text-muted-foreground">{text.length}/2000</p>
        {preview && <div className="my-3">{file?.type.startsWith('video/')?<video src={preview} controls playsInline className="max-h-60 w-full" />:<img src={preview} alt={l('Önizle')} className="max-h-60 w-full object-contain" />}<button type="button" onClick={()=>chooseFile(null)} className="min-h-11 text-sm text-primary">{l('Kaldır')}</button></div>}
        <input ref={upload} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="hidden" onChange={event=>{const selected=event.target.files?.[0];event.target.value='';if(selected){if(selected.size>50*1024*1024)setError(errors.FILE_TOO_LARGE);else {chooseFile(selected);setError('');}}}} />
        <div className="flex flex-wrap items-center gap-3 py-3"><button type="button" onClick={()=>upload.current?.click()} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm"><ImagePlus className="h-5 w-5" />{l('Medya ekle')}</button>{!storyMode && <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={short} onChange={event=>setShort(event.target.checked)} />Nodes Reel</label>}</div>
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{l(error)}</p>}
        <button disabled={sending||(!text.trim()&&!file)} className="min-h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{sending?t.common.loading:l('Paylaş')}</button>
      </form>
    </div>}
    {commentPost && <div role="dialog" aria-modal="true" aria-label={l('Yorumlar')} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"><div className="w-full max-w-lg rounded-3xl bg-card p-5">
      <div className="flex justify-between items-center"><h2 className="font-semibold">{l('Yorumlar')}</h2><button aria-label={t.common.close} onClick={()=>setCommentPost(null)} className="grid h-11 w-11 place-items-center"><X className="h-5 w-5" /></button></div>
      <div className="max-h-[45dvh] overflow-y-auto">{comments.map(c=><div key={c.id} className="border-b border-border py-3"><p className="text-xs font-semibold">@{c.username}</p><p className="mt-1 break-words text-sm">{c.text}</p></div>)}</div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{l(error)}</p>}<form className="mt-4 flex gap-2" onSubmit={async event=>{event.preventDefault();const post=posts.find(p=>p.id===commentPost);if(!post||!comment.trim()||pending)return;if(await action(post,{action:'comment',text:comment})) void openComments(post.id);}}><input autoFocus aria-label={l('Yorumlar')} maxLength={500} value={comment} onChange={event=>setComment(event.target.value)} className="min-w-0 flex-1 rounded-xl bg-muted p-3" /><button disabled={!!pending||!comment.trim()} className="min-h-11 px-3 text-sm text-primary">{l('Gönder')}</button></form>
    </div></div>}
  </div>;
}
