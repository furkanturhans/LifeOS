const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm');
function load(file, overrides={}) {
 const exports={}; const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>overrides[name]??require(name),Buffer,Response,Request,FormData,URL,Error,console,process}); return exports;
}
const media=load('src/lib/explore/media.ts');
test('Nodes separates expiring stories, searches text and identity, and scopes own profile',async()=>{
 let query;
 const route=load('src/app/api/explore/posts/route.ts',{
  'next/server':{NextResponse:{json:body=>body}},
  '@/lib/prisma':{prisma:{explorePost:{findMany:async args=>{query=args;return [];}}}},
  '@/lib/explore/server':{exploreSession:async()=>({profile:{id:'mine'},owner:{lifeosId:'me',displayName:'Me'},supabase:{}}),exploreFailure:error=>{throw error;}},
  '@/lib/explore/media':media,
 });
 await route.GET(new Request('http://localhost/api?tab=stories'));
 assert.equal(query.where.kind,'story');
 assert.ok(Math.abs(query.where.createdAt.gte.getTime()-(Date.now()-86400000))<2000);
 await route.GET(new Request('http://localhost/api?tab=feed'));
 assert.equal(query.where.kind.not,'story');
 await route.GET(new Request('http://localhost/api?tab=search&q=hello'));
 assert.equal(query.where.OR[0].text.contains,'hello');
 assert.equal(query.where.OR[1].profile.user.lifeosId.contains,'hello');
 await route.GET(new Request('http://localhost/api?tab=profile&profileId=someone-else'));
 assert.equal(query.where.profileId,'mine');
});
test('media signatures reject scripts, empty files and HEIC disguised as MP4',()=>{
 for(const bytes of [Buffer.alloc(0),Buffer.from('<svg onload=alert(1)>'),Buffer.from('0000ftypheic0000')])assert.equal(media.mediaFormat(bytes),null);
 assert.equal(media.mediaFormat(Buffer.from('0000ftypisom0000')).mime,'video/mp4');
 assert.equal(media.mediaFormat(Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0])).mime,'image/png');
});
test('multipart parser preserves text and enforces size without Content-Length',async()=>{
 const form=new FormData();form.set('text','hello');
 const parsed=await media.boundedFormData(new Request('http://localhost/api',{method:'POST',body:form}));
 assert.equal(parsed.get('text'),'hello');
 const huge=new Uint8Array(media.MAX_MEDIA_BYTES+1024*1024+1);
 await assert.rejects(()=>media.boundedFormData(new Request('http://localhost/api',{method:'POST',body:huge})),/FILE_TOO_LARGE/);
});
test('profile identity comes from verified auth, never a caller-supplied second slot',async()=>{
 const old=process.env.NEXT_PUBLIC_SUPABASE_URL;process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
 let verified=true,upsert;
 const server=load('src/lib/explore/server.ts',{
  '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:verified?{id:'verified-user'}:null}})}})},
  '@/lib/prisma':{prisma:{user:{findUnique:async query=>{assert.equal(query.where.supabaseId,'verified-user');return{id:'owner'};}},exploreProfile:{upsert:async args=>{upsert=args;return{id:'profile'};}}}},
 });
 try {
  await server.exploreSession(new Request('http://localhost/api?slot=1&userId=another',{method:'POST',headers:{origin:'http://localhost'}}));
  assert.equal(upsert.create.userId,'owner');assert.equal(upsert.create.slot,0);assert.equal(upsert.where.userId_slot.slot,0);
  verified=false;await assert.rejects(()=>server.exploreSession(),e=>e.status===401);
  await assert.rejects(()=>server.exploreSession(new Request('http://localhost/api',{method:'POST',headers:{origin:'https://foreign.test'}})),e=>e.status===403);
 } finally {if(old===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=old;}
});
