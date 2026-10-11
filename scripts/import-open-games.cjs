// One-time import. Run against the reviewed checkout; no network requests.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const ts = require('typescript');
const games = [
  ['snake','arcade/Snake','Yılan','🐍','reflex'],
  ['breakout','arcade/Breakout','Tuğla Kırma','🧱','reflex'],
  ['runner','arcade/JumpRunner','Sonsuz Koşu','🏃','reflex'],
  ['jelly','arcade/FlappyJelly','Uçan Denizanası','🪼','reflex'],
  ['pong','arcade/PingPong','Masa Tenisi','🏓','sports'],
  ['space','arcade/SpaceInvader','Uzay Savunması','🚀','reflex'],
  ['2048','puzzle/Game2048','2048','🔢','puzzle'],
  ['match3','puzzle/Match3','Mücevher Eşleştirme','💎','puzzle'],
  ['mines','puzzle/Minesweeper','Mayın Tarlası','💣','puzzle'],
  ['slide','puzzle/SlidePuzzle','Kaydırmalı Bulmaca','🧩','puzzle'],
  ['sokoban','puzzle/Sokoban','Kutu İtme','📦','puzzle'],
  ['lights','puzzle/LightsOut','Işıkları Söndür','💡','puzzle'],
  ['colors','puzzle/ColorSort','Renk Sıralama','🧪','puzzle'],
  ['hanoi','puzzle/HanoiTower','Hanoi Kuleleri','🗼','puzzle'],
  ['memory','cards/MemoryMatch','Hafıza Eşleştirme','🃏','puzzle'],
  ['four','cards/ConnectFour','Dörtlü Bağlantı','🔴','strategy'],
  ['reversi','cards/Othello','Reversi','⚫','strategy'],
  ['towers','strategy/TowerDefense','Kule Savunması','🏰','strategy'],
  ['basket','sports/BasketballShoot','Basket Atışı','🏀','sports'],
  ['archery','sports/ArcheryGame','Okçuluk','🏹','sports'],
];
const words = {
  '🏆 대단해!':'🏆 Harika!', '💀 게임 오버':'Oyun Bitti', '개':'',
  '마우스/터치로 패들 이동!':'', '게임 오버!':'Oyun Bitti',
  '🔥 속도 UP!':'🔥', '클릭/스페이스로 시작!':'Başla', '💀 게임 오버!':'Oyun Bitti',
  '🔥 나이스!':'Harika!', '점':'', '나':'Sen', '연속!':'',
  '🔥 파워볼! AI가 당황합니다!':'🔥', '마우스로 패들 이동! 5연속 랠리 → 파워볼!':'',
  '🏆 승리!':'Kazandın!', '😢 패배 (최대':'Oyun Bitti (', '랠리)':' )',
  '🏆 클리어!':'Kazandın!', '타일 이동하기':'2048',
  '방향키(↑↓←→) 또는 화면을 스와이프하면\n모든 타일이 해당 방향으로 이동해요!':'↑ ↓ ← →',
  '📱 모바일: 스와이프':'← →', '💻 PC: 방향키':'↑ ↓ ← →',
  '같은 숫자 합치기':'2048', '같은 숫자 타일이 만나면 합쳐져요!\n2 + 2 = 4,  4 + 4 = 8,  8 + 8 = 16 ...':'2 + 2 = 4 · 4 + 4 = 8',
  '전략 & 목표':'2048', '2048 타일을 만들면 최고 점수!\n큰 숫자를 한쪽 구석에 모으는 게 핵심이에요.':'2048',
  '← 목표!':'← 2048', '💡 큰 수는 구석에':'↙', '💡 한 방향 유지':'←',
  '건너뛰기':'Atla', '🎮 시작하기!':'Başla', '다음 (':'Sonraki (',
  '스코어:':'Puan:', '최대:':'En iyi:', '게임 방법 보기':'Nasıl Oynanır?',
  '↑↓←→ 방향키 또는 스와이프로 이동 · 같은 숫자끼리 합쳐져요!':'↑ ↓ ← →',
  '이동:':'Hamle:', '클리어:':'Puan:', '인접한 보석을 선택하여 스와프! 3개 이상 연결시 클리어':'',
  '개 | 🚩':' | 🚩', '— 🎉 클리어!':'Kazandın!', '좌클릭: 열기 | 우클릭: 깃발 🚩':'',
  '위치:':'✓', '🎉 완성!':'Kazandın!', '빈 칸 옆 숫자를 클릭 (방향키 가능)':'',
  '📦를 🎯로 밀어 넣으세요 (방향키/버튼)':'📦 → 🎯', '남은 불:':'💡',
  '모든 불을 끄세요! 클릭하면 주변도 토글':'', '빨강':'Kırmızı', '초록':'Yeşil', '파랑':'Mavi', '노랑':'Sarı',
  '같은 색끼리 하나의 병에 모아주세요':'', '최소:':'🎯', '원반:':'🗼',
  '기둥 클릭으로 원반 이동 ─ 모두 C로 옮기세요':'→ C', '퍼펙트! ✨':'Harika!', '완료!':'Tamamlandı', '회 이동':'',
  '매치:':'✓', '🎉 완벽! (':'Kazandın! (', '번 만에 클리어!)':')',
  '승리!':'Kazandın!', '차례:':'', '| 🔴 = 나 / 🟡 = AI':'| 🔴 = 👤 / 🟡 = 🤖',
  '패스! AI 턴':'🤖', '🏆 승리! (':'Kazandın! (', '🤝 무승부':'Berabere', '😢 패배 (':'Oyun Bitti (',
  '당신은 ⚫ (검은돌)입니다':'👤 = ⚫', '🗼 타워(💰1) 배치로 적을 막으세요!':'🗼 = 💰 1',
  '🏀 골인!':'🏀', '😢 빗나감...':'❌', '골':'', '🏀 슛!':'🏀', '골인':'🏀',
  '🎯 10점!':'🎯 10', '8점!':'8', '6점!':'6', '4점':'4', '2점':'2', '점수:':'Puan:', '바람:':'💨', '🏹 발사!':'🏹',
};
const root = '.tmp-zeli-games';
const out = 'src/vendor/open-games';
fs.mkdirSync(out, { recursive:true });
const commit=cp.execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
fs.copyFileSync(path.join(root,'LICENSE'),path.join(out,'LICENSE'));
if(fs.existsSync(path.join(root,'NOTICE')))fs.copyFileSync(path.join(root,'NOTICE'),path.join(out,'UPSTREAM-NOTICE'));
const manifest=[];
for(const [id,source,title,emoji,category] of games){
  const raw=fs.readFileSync(`${root}/src/games/${source}.jsx`,'utf8');
  const ast=ts.createSourceFile(source+'.jsx',raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.JSX);
  const edits=[];
  const translate=s=>{ const trimmed=s.trim(); if(!(trimmed in words))throw Error('Missing: '+trimmed);return words[trimmed]; };
  function visit(n){
    if(ts.isTemplateExpression(n)&&/[가-힣]/.test(n.getText(ast))){
      // Translate individual literal segments while retaining expressions.
      let value=n.getText(ast);
      for(const segment of [n.head,...n.templateSpans.map(s=>s.literal)]){
        if(/[가-힣]/.test(segment.text)) value=value.replace(segment.text,translate(segment.text));
      }
      edits.push([n.getStart(ast),n.end,`gameText(${value})`]);return;
    }
    if((ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)||ts.isJsxText(n))&&/[가-힣]/.test(n.text)){
      const expression=`gameText(${JSON.stringify(translate(n.text))})`;
      edits.push([n.getStart(ast),n.end,(ts.isJsxText(n)||ts.isJsxAttribute(n.parent))?`{${expression}}`:expression]);return;
    }
    ts.forEachChild(n,visit);
  }
  visit(ast);
  let code=raw;
  for(const [start,end,value] of edits.sort((a,b)=>b[0]-a[0]))code=code.slice(0,start)+value+code.slice(end);
  code=`// Adapted by LifeOS: localized UI, touch controls, gameplay fixes. Apache-2.0.\n// Upstream: https://github.com/hajunho/zeli-web-games @ ${commit}\nimport { gameText } from './text';\n`+code;
  fs.writeFileSync(`${out}/${id}.jsx`,code,'utf8');
  manifest.push({id,source,title,emoji,category});
}
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify({repository:'https://github.com/hajunho/zeli-web-games',commit,license:'Apache-2.0',games:manifest},null,2)+'\n');
fs.writeFileSync(`${out}/NOTICE`,`Zeli Web Games — Hajun Ho and contributors\nhttps://github.com/hajunho/zeli-web-games\nUpstream revision: ${commit}\nLicensed under Apache License 2.0; see LICENSE.\nLifeOS modifications: Turkish UI, locale bridge, touch controls and gameplay fixes.\n`);
console.log(`Imported ${games.length} games at ${commit}`);
