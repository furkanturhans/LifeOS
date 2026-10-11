import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const target = path.join(root, 'public/kids/drawings'); fs.mkdirSync(target, { recursive: true });
const animals = [['1f408','Kedi'],['1f415','Köpek'],['1f407','Tavşan'],['1f43c','Panda'],['1f428','Koala'],['1f42f','Kaplan'],['1f981','Aslan'],['1f43b','Ayı'],['1f98a','Tilki'],['1f418','Fil'],['1f992','Zürafa'],['1f993','Zebra'],['1f40e','At'],['1f984','Tekboynuz'],['1f416','Domuz'],['1f404','İnek'],['1f411','Koyun'],['1f410','Keçi'],['1f42a','Deve'],['1f98c','Geyik'],['1f412','Maymun'],['1f98d','Goril'],['1f43f','Sincap'],['1f994','Kirpi'],['1f422','Kaplumbağa'],['1f438','Kurbağa'],['1f40c','Salyangoz'],['1f98b','Kelebek'],['1f41d','Arı'],['1f41e','Uğurböceği'],['1f41c','Karınca'],['1f419','Ahtapot'],['1f42c','Yunus'],['1f433','Balina'],['1f41f','Balık'],['1f420','Renkli balık'],['1f427','Penguen'],['1f426','Kuş'],['1f424','Civciv'],['1f986','Ördek'],['1f985','Kartal'],['1f989','Baykuş'],['1f99a','Tavus kuşu'],['1f99c','Papağan'],['1f40a','Timsah'],['1f995','Dinozor'],['1f406','Leopar'],['1f429','Kaniş'],['1f403','Manda'],['1f40b','Büyük balina'],['1f34e','Elma'],['1f350','Armut'],['1f34a','Mandalina'],['1f34b','Limon'],['1f34c','Muz'],['1f349','Karpuz'],['1f347','Üzüm'],['1f353','Çilek'],['1f352','Kiraz'],['1f351','Şeftali']];
const items = []; const commit = execFileSync('git',['-C','.tmp-kids-drawings','rev-parse','HEAD'],{encoding:'utf8'}).trim();
for (const [code,title] of animals) {
  const file = `.tmp-kids-drawings/2D/svg/emoji_u${code}.svg`; if (!fs.existsSync(file)) throw new Error('Missing drawing ' + file);
  let svg = fs.readFileSync(file,'utf8');
  // Local, non-executable vector adaptation. All painted regions become paper white.
  svg = svg.replace(/<\?xml[^>]*>/g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<defs[\s\S]*?<\/defs>/g,'').replace(/<(?:linearGradient|radialGradient)[\s\S]*?<\/(?:linearGradient|radialGradient)>/g,'');
  svg = svg.replace(/\sstyle="[^"]*"/g,'').replace(/\s(?:fill|stroke|stroke-width|opacity)="[^"]*"/g,'');
  svg = svg.replace(/<(path|circle|ellipse|rect|polygon|polyline)\b/g,'<$1 fill="white" stroke="#172033" stroke-width="1.25" stroke-linejoin="round"');
  if (/<script|<foreignObject|\bon\w+=|(?:href|src)\s*=/i.test(svg)) throw new Error('Unsafe SVG ' + code);
  fs.writeFileSync(path.join(target,`noto-${code}.svg`),svg);
  items.push({id:`draw-${code}`,title,description:'Alan boyama ve özgür fırça',category:'drawing',ageMin:3,ageMax:7,locale:'tr',status:'published',image:`/kids/drawings/noto-${code}.svg`,license:'Apache 2.0',licenseUrl:'https://www.apache.org/licenses/LICENSE-2.0',author:'Google Noto Emoji contributors',illustrator:'Google Noto Emoji · LifeOS siyah beyaz uyarlama',source:'https://github.com/googlefonts/noto-emoji',sourceCommit:commit,reviewed:true,reviewNote:'Apache 2.0 görsel kaynağından siyah beyaz çizgi çalışmasına uyarlandı; harici bağlantı veya çalıştırılabilir SVG içeriği yok.'});
}
const glyphs = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ', ...'0123456789', '∿'];
for (let index=0; index<glyphs.length; index++) {
  const glyph=glyphs[index]; const id=`trace-${index+1}`; const title=index<29?`${glyph} harfinin üzerinden geç`:index<39?`${glyph} rakamının üzerinden geç`:'Dalgalı çizgiler';
  const shape=index===39?'<path d="M65 220 Q130 110 195 220 T325 220 T455 220 T565 220 M65 380 Q130 270 195 380 T325 380 T455 380 T565 380" fill="none" stroke="#a0a8b5" stroke-width="8" stroke-dasharray="6 10"/>':`<text x="300" y="435" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="390" fill="none" stroke="#a0a8b5" stroke-width="3" stroke-dasharray="5 7">${glyph}</text>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="white"/><path d="M35 100H565 M35 450H565" stroke="#e2e8f0" stroke-width="2"/>${shape}</svg>`;
  fs.writeFileSync(path.join(target,`${id}.svg`),svg);
  items.push({id,title,description:'Zorunluluk olmadan, kendi hızında fırça çalışması',category:'drawing',ageMin:4,ageMax:7,locale:'tr',status:'published',image:`/kids/drawings/${id}.svg`,tracing:true,license:'LifeOS original',author:'LifeOS',source:'LifeOS',reviewed:true,reviewNote:'Özgün iz sürme sayfası; puanlama veya yazma becerisi değerlendirmesi yapmaz. Çocuk istemezse boş tuval kullanabilir.'});
}
if(items.length!==100) throw new Error('Expected 100 drawings: '+items.length);
fs.copyFileSync('.tmp-kids-drawings/2D/svg/LICENSE',path.join(target,'LICENSE.txt'));
fs.writeFileSync(path.join(target,'NOTICE.txt'),'Google Noto Emoji image resources. Copyright 2013 Google, Inc. Apache License 2.0. Adapted by LifeOS: original colors and gradients replaced by monochrome outlines. Source https://github.com/googlefonts/noto-emoji/tree/main/2D/svg. Original tracing pages: LifeOS.\n');
fs.writeFileSync('src/components/kids/experience/catalog/drawings.json',JSON.stringify(items,null,2)+'\n'); console.log('Drawing and tracing sheets:',items.length);
