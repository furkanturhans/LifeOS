import fs from 'node:fs';import assert from 'node:assert/strict';
const origin='http://localhost:3000';const root='.next/cache/kids-content';const db=root+'/content.json';const backup=fs.existsSync(db)?fs.readFileSync(db):null;
const key=fs.readFileSync(root+'/admin-key.txt','utf8').trim();
const login=await fetch(origin+'/api/kids/admin/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({key})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
const headers={Origin:origin,Cookie:cookie,'Content-Type':'application/json'};const base=JSON.parse(fs.readFileSync('src/components/kids/experience/catalog/education.json'))[0];const item={...base,id:'test-kids-review-cycle',title:'Yayın akışı denemesi',status:'draft',reviewed:false,reviewNote:''};
const save=async value=>fetch(origin+'/api/kids/admin/content',{method:'POST',headers,body:JSON.stringify({action:'content',item:value})});
const catalog=async()=>{const response=await fetch(origin+'/api/kids/content');assert.equal(response.status,200);return response.json();};
let uploaded;
try{
 assert.equal((await save(item)).status,200);assert.ok(!(await catalog()).content.some(entry=>entry.id===item.id));
 assert.equal((await save({...item,status:'published'})).status,400);
 assert.equal((await save({...item,status:'published',reviewed:true,reviewNote:'Yerel yayın akışı testi.'})).status,200);assert.ok((await catalog()).content.some(entry=>entry.id===item.id));
 assert.equal((await save({...item,status:'archived'})).status,200);assert.ok(!(await catalog()).content.some(entry=>entry.id===item.id));
 const unauthorized=await fetch(origin+'/api/kids/admin/content',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-User-Id':'admin'},body:JSON.stringify({action:'content',item})});assert.equal(unauthorized.status,403);
 const proposal=await fetch(origin+'/api/kids/proposals',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-User-Id':'parent'},body:JSON.stringify({})});assert.equal(proposal.status,401);
 const entry=await fetch(origin+'/api/kids/contests/entries',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','X-User-Id':'parent'},body:JSON.stringify({})});assert.equal(entry.status,401);
 assert.equal((await fetch(origin+'/api/kids/admin/entries/00000000-0000-0000-0000-000000000000')).status,403);
 const wrongOrigin=await fetch(origin+'/api/kids/admin/content',{method:'POST',headers:{...headers,Origin:'https://example.org'},body:JSON.stringify({action:'content',item})});assert.equal(wrongOrigin.status,403);
 const svg=new FormData();svg.set('file',new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],{type:'image/svg+xml'}),'unsafe.svg');const unsafe=await fetch(origin+'/api/kids/admin/assets',{method:'POST',headers:{Origin:origin,Cookie:cookie},body:svg});assert.equal(unsafe.status,400);
 const safeForm=new FormData();safeForm.set('file',new Blob(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="white"/></svg>'],{type:'image/svg+xml'}),'safe.svg');
 const upload=await fetch(origin+'/api/kids/admin/assets',{method:'POST',headers:{Origin:origin,Cookie:cookie},body:safeForm});assert.equal(upload.status,200);uploaded=(await upload.json()).url;
 assert.equal((await fetch(origin+uploaded)).status,404);assert.equal((await fetch(origin+uploaded,{headers:{Cookie:cookie}})).status,200);
 assert.equal((await save({...item,image:uploaded,status:'published',reviewed:true,reviewNote:'Yerel özel görsel yayın testi.'})).status,200);assert.equal((await fetch(origin+uploaded)).status,200);
 assert.equal((await save({...item,image:uploaded,status:'archived'})).status,200);assert.equal((await fetch(origin+uploaded)).status,404);
 console.log('Live API checks passed: owner login, draft privacy, editorial gate, publish/archive, forged-user denial, parent authentication, private artwork, CSRF and SVG rejection.');
}finally{if(uploaded)fs.rmSync(root+'/assets/'+uploaded.split('/').at(-1),{force:true});if(backup)fs.writeFileSync(db,backup);else fs.rmSync(db,{force:true});await fetch(origin+'/api/kids/admin/session',{method:'DELETE',headers:{Origin:origin,Cookie:cookie}});}
