import fs from 'node:fs';import assert from 'node:assert/strict';
const origin='http://localhost:3000';const directory='.next/cache/kids-content';const file=directory+'/content.json';const backup=fs.existsSync(file)?fs.readFileSync(file):null;
const key=fs.readFileSync(directory+'/admin-key.txt','utf8').trim();const login=await fetch(origin+'/api/kids/admin/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({key})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];const headers={Origin:origin,Cookie:cookie,'Content-Type':'application/json'};
const candidate=JSON.parse(fs.readFileSync('src/components/kids/experience/catalog/videos-candidates.json','utf8'))[0];const item={...candidate,id:'video-test-review',title:'Video review test'};
const save=value=>fetch(origin+'/api/kids/admin/videos',{method:'POST',headers,body:JSON.stringify(value)});const publicVideos=async()=>{const r=await fetch(origin+'/api/kids/videos');assert.equal(r.status,200);return (await r.json()).videos;};
try{
 const admin=await fetch(origin+'/api/kids/admin/videos',{headers:{Cookie:cookie}});assert.equal(admin.status,200);const data=await admin.json();assert.equal(data.videos.length,100);assert.equal(data.providers.length,4);assert.ok(data.providers.find(x=>x.id==='commons').configured);assert.ok(data.providers.find(x=>x.id==='nasa').configured);
 assert.equal((await fetch(origin+'/api/kids/admin/videos')).status,403);
 assert.equal((await save(item)).status,200);assert.ok(!(await publicVideos()).some(x=>x.id===item.id));
 assert.equal((await save({...item,status:'published'})).status,400);
 assert.equal((await save({...item,status:'published',reviewed:true,languageChecked:true,reviewNote:'Local test only.'})).status,200);assert.ok((await publicVideos()).some(x=>x.id===item.id));
 assert.equal((await save({...item,status:'archived'})).status,200);assert.ok(!(await publicVideos()).some(x=>x.id===item.id));
 const forged=await fetch(origin+'/api/kids/admin/videos',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-User-Id':'admin'},body:JSON.stringify(item)});assert.equal(forged.status,403);
 const wrongOrigin=await fetch(origin+'/api/kids/admin/videos',{method:'POST',headers:{...headers,Origin:'https://example.org'},body:JSON.stringify(item)});assert.equal(wrongOrigin.status,403);
 for(const provider of ['commons','nasa']){const query=provider==='commons'?'butterfly':'solar system';const response=await fetch(origin+'/api/kids/admin/videos?'+new URLSearchParams({provider,q:query,topic:provider==='commons'?'animals':'space'}),{headers:{Cookie:cookie}});const result=await response.json();assert.equal(response.status,200,provider+': '+result.error);assert.ok(result.videos.length>0,provider+' no candidates');assert.ok(result.videos.every(x=>x.status==='draft'&&!x.reviewed));console.log(provider,'candidate search:',result.sourceMode,result.videos.length);}
 console.log('Live video checks passed: 100 private candidates, four provider adapters, two configured sources, review gate, publish/archive, CSRF, auth and source search (live/cache mode reported).');
}finally{if(backup)fs.writeFileSync(file,backup);else fs.rmSync(file,{force:true});await fetch(origin+'/api/kids/admin/session',{method:'DELETE',headers:{Origin:origin,Cookie:cookie}});}
