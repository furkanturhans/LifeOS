import fs from 'node:fs';
const searches=[['animals','butterfly'],['animals','duck'],['animals','rabbit'],['animals','elephant'],['animals','penguin'],['animals','aquarium'],['animals','cat playing'],['animals','dog walking'],['animals','bird bathing'],['nature','plant growing'],['nature','flower timelapse'],['nature','rain clouds'],['science','water drops'],['space','solar system animation'],['creativity','stop motion animation']];
const strip=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const items=new Map();
for(const [topic,query] of searches){
 const url=new URL('https://commons.wikimedia.org/w/api.php');for(const [k,v] of Object.entries({action:'query',format:'json',generator:'search',gsrsearch:'filetype:video '+query,gsrnamespace:'6',gsrlimit:'20',prop:'videoinfo',viprop:'url|size|derivatives|extmetadata',viurlwidth:'480'}))url.searchParams.set(k,v);
 const response=await fetch(url,{headers:{'User-Agent':'LifeOSKidsCatalog/1.0 (educational video curation)'},signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Commons HTTP '+response.status);const data=await response.json();
 for(const page of Object.values(data.query?.pages??{})){
  const info=page.videoinfo?.[0];if(!info || info.duration<8 || info.duration>240)continue;
  const m=info.extmetadata??{};let license=strip(m.LicenseShortName?.value);if(license==='Public domain')license='Public domain';
  if(!['CC0','Public domain','CC BY 3.0','CC BY 4.0','CC BY-SA 3.0','CC BY-SA 4.0'].includes(license))continue;
  const text=strip(m.ImageDescription?.value);if(/dead|kill|hunt|predat|blood|mating|copulat|eat(?:ing)? (?:fish|animal)|attack|surgery|weapon|firework|explosion|courtship|trailer|duck soup|singing duck|butterfly stroke|road condition|motorcycle|truck|duck race|drowning/i.test(page.title+' '+text))continue;
  const sources=(info.derivatives??[]).filter(s=>s.type?.startsWith('video/webm')&&s.height>=360&&s.height<=720).sort((a,b)=>a.height-b.height).slice(0,2).map(s=>({url:s.src.replace(/^http:/,'https:'),mime:'video/webm'}));
  if(!sources.length&&info.url?.includes('.webm'))sources.push({url:info.url,mime:'video/webm'});if(!sources.length)continue;
  const creator=strip(m.Artist?.value)||strip(m.Attribution?.value);if(!creator)continue;
  const item={id:'commons-'+page.pageid,provider:'commons',providerId:String(page.pageid),title:page.title.replace(/^File:/,'').replace(/\.(webm|ogv|mp4)$/i,'').replaceAll('_',' '),description:text.slice(0,4000),translations:{},topic,ageMin:3,ageMax:7,durationSeconds:info.duration,sources,poster:info.thumburl,audioLanguages:[],captions:[],license,licenseUrl:(m.LicenseUrl?.value||'https://creativecommons.org/publicdomain/mark/1.0/').replace(/^http:/,'https:'),sourceUrl:info.descriptionurl,creator:creator.slice(0,1000),status:'draft',reviewed:false,languageChecked:false,reviewNote:''};
  items.set(item.id,item);
 }
 console.log(query,'unique candidates:',items.size);
 if(items.size>=100)break;
}
const nasa=[];
const nasaSearch=await fetch('https://images-api.nasa.gov/search?q=solar%20system&media_type=video&page_size=8',{signal:AbortSignal.timeout(30000)});if(!nasaSearch.ok)throw Error('NASA HTTP '+nasaSearch.status);
for(const entry of (await nasaSearch.json()).collection.items){
 const metadata=entry.data[0];if(!entry.href.startsWith('https://images-assets.nasa.gov/'))continue;
 const response=await fetch(entry.href,{signal:AbortSignal.timeout(20000)});if(!response.ok)continue;
 const files=(await response.json()).map(url=>url.replace(/^http:/,'https:')).filter(url=>url.startsWith('https://images-assets.nasa.gov/')&&/~(?:mobile|small|medium)\.mp4$/.test(url));if(!files.length)continue;
 const id=metadata.nasa_id;nasa.push({id:'nasa-'+id.toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,110),provider:'nasa',providerId:id,title:strip(metadata.title),description:strip(metadata.description).slice(0,4000),translations:{},topic:'space',ageMin:5,ageMax:7,durationSeconds:0,sources:files.slice(0,2).map(url=>({url,mime:'video/mp4'})),poster:entry.links.find(link=>link.render==='image')?.href,audioLanguages:[],captions:[],license:'NASA media guidelines',licenseUrl:'https://www.nasa.gov/nasa-brand-center/images-and-media/',sourceUrl:'https://images.nasa.gov/details/'+encodeURIComponent(id),creator:strip(metadata.photographer)||'NASA',status:'draft',reviewed:false,languageChecked:false,reviewNote:'API süresi bilinmiyor: oynatıcıdan doğrulayın. NASA kaynağındaki üçüncü taraf müzik ve görüntü haklarını ayrıca inceleyin.'});
}
const result=[...items.values()].slice(0,100-nasa.length).concat(nasa);fs.writeFileSync('src/components/kids/experience/catalog/videos-candidates.json',JSON.stringify(result,null,2)+'\n');console.log('Video drafts:',result.length);
