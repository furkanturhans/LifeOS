const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,names=[]){
 let source=fs.readFileSync(file,'utf8');
 if(names.length)source+='\nexport { '+names.join(',')+' };';
 const code=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;
 const context={exports:{},require:id=>id==='./text'?{gameText:s=>s}:id.includes('manifest.json')?require('../src/vendor/open-games/manifest.json'):require(id),console};
 vm.runInNewContext(code,context);return context.exports;
}
function timerHarness(){
 let time=0, id=0;const pending=new Map();
 const native={setTimeout(fn,delay){const key=++id;pending.set(key,{fn,at:time+delay});return key;},clearTimeout(key){pending.delete(key);}};
 const clock=load('src/vendor/open-games/clock.js').createGameClock(native,()=>time);
 function advance(ms){const target=time+ms;while(true){const due=[...pending].filter(([,v])=>v.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;pending.delete(due[0]);time=due[1].at;due[1].fn();}time=target;}
 return {clock,advance,pending};
}
test('Paused games preserve the remaining timeout and exclude background time',()=>{
 const {clock,advance}=timerHarness();let called=0;clock.setTimeout(()=>called++,100);advance(1000);assert.equal(called,0);
 clock.resume();advance(30);clock.pause();const now=clock.now();advance(60000);assert.equal(clock.now(),now);assert.equal(called,0);
 clock.resume();advance(69);assert.equal(called,0);advance(1);assert.equal(called,1);
});
test('Intervals resume without a catch-up burst; disposal cancels all pending work',()=>{
 const {clock,advance,pending}=timerHarness();let ticks=0;const id=clock.setInterval(()=>ticks++,20);clock.resume();advance(50);assert.equal(ticks,2);
 clock.pause();advance(10000);clock.resume();advance(10);assert.equal(ticks,3);clock.clearInterval(id);advance(1000);assert.equal(ticks,3);
 clock.setTimeout(()=>ticks++,10);clock.setInterval(()=>ticks++,5);clock.dispose();advance(1000);assert.equal(ticks,3);assert.equal(pending.size,0);
});
test('A recurring timer can cancel itself',()=>{
 const {clock,advance}=timerHarness();let called=0;const id=clock.setInterval(()=>{called++;clock.clearInterval(id);},10);clock.resume();advance(100);assert.equal(called,1);
});
test('2,000 shuffled sliding boards remain solvable, nontrivial and contain all tiles',()=>{
 const {shuffle,GOAL}=load('src/vendor/open-games/slide.jsx',['shuffle','GOAL']);
 for(let k=0;k<2000;k++){
  const board=shuffle();assert.deepEqual([...board].sort(),[0,1,2,3,4,5,6,7,8]);assert.ok(board.some((v,i)=>v!==GOAL[i]));
  const numbers=board.filter(Boolean);let inversions=0;for(let i=0;i<numbers.length;i++)for(let j=i+1;j<numbers.length;j++)if(numbers[i]>numbers[j])inversions++;
  assert.equal(inversions%2,0);
 }
});
test('2048 merges each tile once per move and conserves its numeric total',()=>{
 const {mergeRow,rotateGrid}=load('src/vendor/open-games/2048.jsx',['mergeRow','rotateGrid']);
 for(const [row,expected,gain] of [[[2,2,2,2],[4,4,0,0],8],[[2,2,4,0],[4,4,0,0],4],[[4,4,8,8],[8,16,0,0],24]]){
  const value=mergeRow(row);assert.deepEqual([...value.row],expected);assert.equal(value.score,gain);assert.equal(value.row.reduce((a,b)=>a+b),row.reduce((a,b)=>a+b));
 }
 const original=[[1,2],[3,4]];let grid=original;for(let i=0;i<4;i++)grid=rotateGrid(grid);assert.equal(JSON.stringify(grid),JSON.stringify(original));
});
test('Minesweeper reserves the first selected cell and computes correct neighboring counts',()=>{
 const {createBoard}=load('src/vendor/open-games/mines.jsx',['createBoard']);
 for(let k=0;k<100;k++){
  const r=k%6,c=Math.floor(k/6)%6,board=createBoard(r,c);assert.equal(board[r][c].mine,false);assert.equal(board.flat().filter(cell=>cell.mine).length,6);
  for(let row=0;row<6;row++)for(let col=0;col<6;col++)if(!board[row][col].mine){let neighbors=0;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(board[row+dr]?.[col+dc]?.mine)neighbors++;assert.equal(board[row][col].count,neighbors);}
 }
});
test('Reversi permits only legal captures and identifies all forced-pass moves',()=>{
 const {initBoard,getValidMoves,getFlips}=load('src/vendor/open-games/reversi.jsx',['initBoard','getValidMoves','getFlips']);
 const board=initBoard();assert.equal(getValidMoves(board,1).length,4);assert.equal(getValidMoves(board,2).length,4);assert.equal(getFlips(board,0,0,1).length,0);
 const full=Array.from({length:6},()=>Array(6).fill(1));assert.equal(getValidMoves(full,1).length,0);assert.equal(getValidMoves(full,2).length,0);
});
test('Game preference input cannot import unknown games, duplicate pins or invalid scores',()=>{
 const {parseGamePreferences}=load('src/lib/arcade/open-games.ts');
 const p=parseGamePreferences(JSON.stringify({favorites:['snake','snake','unknown'],recent:['2048','snake'],best:{snake:90,unknown:100,'2048':-3,colors:'99'}}));
 assert.equal(JSON.stringify(p.favorites),'["snake"]');assert.equal(JSON.stringify(p.best),'{"snake":90}');
 assert.equal(parseGamePreferences('{broken').favorites.length,0);
});
