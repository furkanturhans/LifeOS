const fs=require('fs'),path=require('path'),ts=require('typescript');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='generated'?[]:e.isDirectory()?walk(path.join(dir,e.name)):/\.(tsx?|jsx?)$/.test(e.name)?[path.join(dir,e.name)]:[]);}
const files=walk('src');const used=new Set();
for(const f of files){const text=fs.readFileSync(f,'utf8');const ast=ts.createSourceFile(f,text,ts.ScriptTarget.Latest,true);
 function visit(n){if(ts.isStringLiteral(n)){
 let value=n.text;let base=value.startsWith('@/')?path.join('src',value.slice(2)):value.startsWith('.')?path.join(path.dirname(f),value):null;
 if(base){for(const suffix of ['', '.ts','.tsx','.js','/index.ts','/index.tsx']){const target=path.normalize(base+suffix);if(files.includes(target))used.add(target);}}
 }ts.forEachChild(n,visit);}visit(ast);
}
const candidates=files.filter(f=>!f.includes(`${path.sep}app${path.sep}`)&&!used.has(f));
console.log(JSON.stringify({sourceFiles:files.length,unreferencedCandidates:candidates},null,2));
