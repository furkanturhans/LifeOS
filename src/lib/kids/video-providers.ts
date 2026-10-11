import 'server-only';
import { videoSchema, type KidsVideo } from './video-schema';

type Row = Record<string, unknown>;
const row = (value: unknown): Row => value && typeof value === 'object' ? value as Row : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const text = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
async function json(url: string, headers?: Record<string,string>) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), cache:'no-store' });
  if (!response.ok) throw Error('PROVIDER_HTTP_' + response.status);
  return row(await response.json());
}
export function providerStatus() {
  return [
    {id:'commons', name:'Wikimedia Commons', configured:true, url:'https://commons.wikimedia.org/w/api.php'},
    {id:'nasa', name:'NASA Images', configured:true, url:'https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf'},
    {id:'pexels', name:'Pexels', configured:!!process.env.KIDS_PEXELS_API_KEY, url:'https://www.pexels.com/api/'},
    {id:'pixabay', name:'Pixabay', configured:!!process.env.KIDS_PIXABAY_API_KEY, url:'https://pixabay.com/api/docs/'},
  ];
}
const searchCache=new Map<string,{expires:number;videos:KidsVideo[]}>();
export async function searchVideos(provider:string, query:string, topic:KidsVideo['topic']):Promise<KidsVideo[]> {
  const cacheKey=provider+'|'+query.toLowerCase()+'|'+topic;
  const cached=searchCache.get(cacheKey);if(cached&&cached.expires>Date.now())return cached.videos;
  const base = { provider, translations:{}, topic, ageMin:3, ageMax:7, audioLanguages:[], captions:[], status:'draft', reviewed:false, languageChecked:false, reviewNote:'' };
  const candidates:unknown[] = [];
  if (provider === 'commons') {
    const url=new URL('https://commons.wikimedia.org/w/api.php');
    for (const [key,value] of Object.entries({action:'query',format:'json',generator:'search',gsrsearch:'filetype:video '+query,gsrnamespace:'6',gsrlimit:'12',prop:'videoinfo',viprop:'url|size|derivatives|extmetadata',viurlwidth:'480'}))url.searchParams.set(key,value);
    const data=await json(url.href);
    for(const entry of Object.values(row(row(data.query).pages))) {
      const page=row(entry), info=row(list(page.videoinfo)[0]), meta=row(info.extmetadata);
      const value=(key:string)=>text(row(meta[key]).value);
      const sources=list(info.derivatives).map(row).filter(file=>String(file.type).startsWith('video/webm') && Number(file.height)>=360 && Number(file.height)<=720).slice(0,2).map(file=>({url:file.src,mime:'video/webm'}));
      if(!sources.length && String(info.url).includes('.webm')) sources.push({url:info.url,mime:'video/webm'});
      candidates.push({...base,id:'commons-'+page.pageid,providerId:String(page.pageid),title:text(page.title).replace(/^File:/,'').replace(/\.(webm|ogv|mp4)$/i,''),description:value('ImageDescription').slice(0,4000),durationSeconds:info.duration,sources,poster:info.thumburl,license:value('LicenseShortName'),licenseUrl:(value('LicenseUrl')||'https://creativecommons.org/publicdomain/mark/1.0/').replace(/^http:/,'https:'),sourceUrl:info.descriptionurl,creator:(value('Artist')||value('Attribution')).slice(0,1000)});
    }
  } else if(provider==='nasa') {
    const url=new URL('https://images-api.nasa.gov/search');url.searchParams.set('q',query);url.searchParams.set('media_type','video');url.searchParams.set('page_size','8');
    const data=await json(url.href);
    await Promise.all(list(row(data.collection).items).map(async entry=>{
      const item=row(entry), metadata=row(list(item.data)[0]);
      // NASA descriptions can credit third-party music: these are never automatically cleared.
      const manifest=String(item.href);if(!manifest.startsWith('https://images-assets.nasa.gov/'))return;
      const response=await fetch(manifest,{signal:AbortSignal.timeout(15000),cache:'no-store'});if(!response.ok)return;
      const files=list(await response.json()).map(value=>String(value).replace(/^http:/,'https:')).filter(url=>url.startsWith('https://images-assets.nasa.gov/')&&/~(?:mobile|small|medium)\.mp4$/.test(url));
      if(!files.length)return;
      const id=String(metadata.nasa_id);const image=list(item.links).map(row).find(link=>link.render==='image');
      candidates.push({...base,id:'nasa-'+id.toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,110),providerId:id,title:text(metadata.title),description:text(metadata.description).slice(0,4000),durationSeconds:0,sources:files.slice(0,2).map(url=>({url,mime:'video/mp4'})),poster:image?.href,license:'NASA media guidelines',licenseUrl:'https://www.nasa.gov/nasa-brand-center/images-and-media/',sourceUrl:'https://images.nasa.gov/details/'+encodeURIComponent(id),creator:text(metadata.photographer)||'NASA',reviewNote:'Süreyi oynatıcıdan doğrulayın. Üçüncü taraf müzik/görsel kredilerini ve NASA medya kullanım koşullarını ayrıca inceleyin.'});
    }));
  } else if(provider==='pexels') {
    const key=process.env.KIDS_PEXELS_API_KEY;if(!key)throw Error('PROVIDER_NOT_CONFIGURED');
    const url=new URL('https://api.pexels.com/videos/search');url.searchParams.set('query',query);url.searchParams.set('per_page','12');
    const data=await json(url.href,{Authorization:key});
    for(const entry of list(data.videos)) {const item=row(entry), user=row(item.user);const files=list(item.video_files).map(row).filter(file=>file.file_type==='video/mp4'&&Number(file.width)<=1280).sort((a,b)=>Number(b.width)-Number(a.width));
      candidates.push({...base,id:'pexels-'+item.id,providerId:String(item.id),title:query+' · '+item.id,description:'',durationSeconds:item.duration,sources:files.slice(0,2).map(file=>({url:file.link,mime:'video/mp4'})),poster:item.image,license:'Pexels License',licenseUrl:'https://www.pexels.com/license/',sourceUrl:item.url,creator:text(user.name)});
    }
  } else if(provider==='pixabay') {
    const key=process.env.KIDS_PIXABAY_API_KEY;if(!key)throw Error('PROVIDER_NOT_CONFIGURED');
    const url=new URL('https://pixabay.com/api/videos/');url.searchParams.set('key',key);url.searchParams.set('q',query);url.searchParams.set('safesearch','true');url.searchParams.set('per_page','12');
    const data=await json(url.href);
    for(const entry of list(data.hits)){const item=row(entry), sizes=row(item.videos);const files=[row(sizes.medium),row(sizes.small)].filter(file=>file.url);
      candidates.push({...base,id:'pixabay-'+item.id,providerId:String(item.id),title:query+' · '+item.id,description:text(item.tags),durationSeconds:item.duration,sources:files.map(file=>({url:file.url,mime:'video/mp4'})),poster:files[0]?.thumbnail,license:'Pixabay Content License',licenseUrl:'https://pixabay.com/service/license-summary/',sourceUrl:item.pageURL,creator:text(item.user)});
    }
  } else throw Error('UNKNOWN_PROVIDER');
  const videos=candidates.flatMap(candidate=>{const parsed=videoSchema.safeParse(candidate);return parsed.success?[parsed.data]:[];});
  if(searchCache.size>=100)searchCache.delete(searchCache.keys().next().value!);
  searchCache.set(cacheKey,{expires:Date.now()+86400000,videos});return videos;
}
