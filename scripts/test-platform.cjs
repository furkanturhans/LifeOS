const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,dependencies={}){
 const exports={};const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(compiled,{exports,require:name=>dependencies[name]??require(name),Buffer,Request,Response,URL,Date,Error,console,process});return exports;
}
const E=class extends Error{constructor(status,code){super(code);this.status=status;this.code=code;}};
const next={'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status??200})}}};
const academy={AcademyError:E,academyFailure:error=>({body:{error:error.code??'UNAVAILABLE'},status:error.status??503}),academySession:async()=>({owner:{id:'provider'},canTeach:false}),academyText:(value,max,required=true)=>{if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))throw new E(400,'INVALID_TEXT');return value.trim();},academyInteger:(value,min,max)=>{if(!Number.isSafeInteger(value)||value<min||value>max)throw new E(400,'INVALID_AMOUNT');return value;},academyBody:request=>request.json()};
const rules=load('src/lib/platform/rules.ts');
const json=value=>({body:JSON.parse(JSON.stringify(value,(_,v)=>typeof v==='bigint'?Number(v):v)),status:200});
const request=body=>new Request('http://localhost/api',{method:'POST',body:JSON.stringify(body)});
test('profession specialties grant only their own category',()=>{
 assert.equal(rules.validSpecialty('teacher','teacher'),true);assert.equal(rules.validSpecialty('craftsman','teacher'),false);assert.equal(rules.validSpecialty('__proto__','x'),false);
});
test('private contact identifiers are blocked in public descriptions',()=>{
 for(const text of ['0555 123 45 67','+90 (555) 123-4567','０５５５１２３４５６７','٠٥٥٥١٢٣٤٥٦٧','@ustam','name@example.com','https://example.com','sıfır beş beş beş bir iki üç dört beş altı yedi '])assert.equal(rules.containsContact(text),true,text);
 assert.equal(rules.containsContact('Üç odalı ev, 4. kat, 12 Ekim'),false);
});
test('2000 TL ticket allocates 160 TL commission and 1840 TL company income',()=>{
 const quote=rules.travelSplit(200000);assert.equal(quote.commissionKurus,16000);assert.equal(quote.companyKurus,184000);
 for(const amount of [1,99,101,100000000]){const q=rules.travelSplit(amount);assert.equal(q.totalKurus,q.commissionKurus+q.companyKurus);}
 for(const amount of [-1,0,1.5,Infinity])assert.throws(()=>rules.travelSplit(amount));
});
function fixture({funds=20000,approved=true,failThread=false,kind='moving'}={}){
 let state={balance:funds,unlocks:[],entries:[],threads:[],passes:[]};
 const job={id:'job',kind,specialty:kind==='taxi'?'driver':'partial',title:'Taşıma',description:'Koltuk',ownerId:'customer',status:'open',phone:'05551234567',address:'Private street'};
 const txFor=draft=>({
  serviceRequest:{findUnique:async()=>job,update:async()=>job},
  professionApplication:{findFirst:async()=>approved?{id:'approved'}:null},
  serviceUnlock:{findUnique:async()=>draft.unlocks[0]??null,count:async()=>draft.unlocks.length,create:async({data})=>{const item={id:'unlock',...data};draft.unlocks.push(item);return item;}},
  creditAccount:{updateMany:async({where,data})=>{if(draft.balance<where.balanceMilli.gte)return{count:0};draft.balance-=data.balanceMilli.decrement;return{count:1};}},
  creditEntry:{findUnique:async({where})=>draft.entries.find(item=>item.key===where.key),create:async({data})=>{draft.entries.push(data);return data;}},
  taxiPass:{findFirst:async()=>draft.passes.find(pass=>pass.expiresAt>new Date()),create:async({data})=>{const item={id:'pass',...data};draft.passes.push(item);return item;}},
  lifechatThread:{create:async({data})=>{if(failThread)throw new Error('thread failed');draft.threads.push(data);return data;}},
 });
 const prisma={serviceRequest:{findUnique:async()=>({...job,unlocks:state.unlocks})},$transaction:async(fn,options)=>{assert.equal(options.isolationLevel,'Serializable');const draft=structuredClone(state);const item=await fn(txFor(draft));state=draft;return item;}};
 const platform=load('src/lib/platform/server.ts',{...next,'@/lib/prisma':{prisma},'@/lib/education/academy-server':academy});
 const route=load('src/app/api/services/platform/route.ts',{'@/lib/prisma':{prisma},'@/lib/education/academy-server':academy,'@/lib/platform/rules':rules,'@/lib/platform/server':{...platform,platformJson:json,requireProfession:async()=>{if(!approved)throw new E(403,'PROFESSION_REQUIRED');}}});
 const unlock=()=>route.POST(request({action:'unlock',id:'job',offerKurus:10000,note:'Ready',feeMilli:0,userId:'customer'}));
 return {route,unlock,state:()=>state,job};
}
test('unapproved provider cannot pay to bypass professional verification',async()=>{const f=fixture({approved:false});assert.equal((await f.unlock()).status,403);assert.equal(f.state().balance,20000);assert.equal(f.state().unlocks.length,0);});
test('server-defined 10 credits debited once, ignoring forged fee and user identity',async()=>{const f=fixture();assert.equal((await f.unlock()).status,200);assert.equal((await f.unlock()).status,200);assert.equal(f.state().balance,10000);assert.equal(f.state().entries.length,1);assert.equal(f.state().unlocks[0].providerId,'provider');assert.equal(f.state().threads.length,1);});
test('insufficient funds leave contact access and conversation unopened',async()=>{const f=fixture({funds:9999});assert.equal((await f.unlock()).status,402);assert.equal(f.state().balance,9999);assert.equal(f.state().unlocks.length,0);assert.equal(f.state().threads.length,0);});
test('conversation creation failure rolls back debit and unlock together',async()=>{const f=fixture({failThread:true});assert.equal((await f.unlock()).status,503);assert.equal(f.state().balance,20000);assert.equal(f.state().unlocks.length,0);assert.equal(f.state().entries.length,0);});
test('unpaid provider cannot retrieve a request contact card',async()=>{const f=fixture();const result=await f.route.GET(new Request('http://localhost/api?id=job&kind=moving'));assert.equal(result.status,403);assert.equal(JSON.stringify(result.body).includes('05551234567'),false);});
test('taxi requires a pass, and duplicate pass activation charges 100 credits once',async()=>{const f=fixture({kind:'taxi',funds:200000});assert.equal((await f.unlock()).body.error,'TAXI_PASS_REQUIRED');const body={action:'taxi-pass',key:'one'};assert.equal((await f.route.POST(request(body))).status,200);assert.equal((await f.route.POST(request(body))).status,200);assert.equal(f.state().balance,100000);assert.equal(f.state().passes.length,1);assert.equal((await f.unlock()).status,200);assert.equal(f.state().balance,100000);});
test('revoked and expired approvals are part of every profession query',async()=>{
 let query;const platform=load('src/lib/platform/server.ts',{...next,'@/lib/education/academy-server':academy,'@/lib/prisma':{prisma:{professionApplication:{findFirst:async q=>{query=q;return null;}}}}});
 await assert.rejects(()=>platform.requireProfession('user','craftsman','electrical'),e=>e.status===403);assert.equal(query.where.status,'approved');assert.equal(query.where.specialty,'electrical');assert.equal(query.where.OR.length,2);
});
test('a Lifechat outsider cannot read another conversation',async()=>{
 const platform=load('src/lib/platform/server.ts',{...next,'@/lib/education/academy-server':academy,'@/lib/prisma':{prisma:{lifechatMember:{findUnique:async()=>null}}}});
 await assert.rejects(()=>platform.threadAccess('thread','stranger'),e=>e.status===403);
});
test('Nodes is not a permissible Lifechat context',()=>{const source=fs.readFileSync('src/app/api/lifechat/route.ts','utf8');assert.equal(source.includes("body.action==='nodes'"),false);assert.equal(source.includes("kind:'nodes'"),false);});
test('ticket checkout cannot mint an unpaid ticket',async()=>{
 const route=load('src/app/api/travel/platform/route.ts',{'@/lib/prisma':{prisma:{}},'@/lib/education/academy-server':academy,'@/lib/platform/server':{platformJson:json},'@/lib/platform/rules':rules});
 const result=await route.POST(request({action:'hold',paid:true}));assert.equal(result.status,503);assert.equal(result.body.error,'GATEWAY_NOT_CONFIGURED');
});
test('forged development cookie cannot read or edit a real profile in production',async()=>{
 const old=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try {
  const route=load('src/app/api/user/profile/route.ts',{...next,'next/headers':{cookies:async()=>({get:()=>({value:'victim'})})},'@/lib/prisma':{prisma:{}},'@/lib/utils':{},'@/lib/localDb':{},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:null}})}})}});
  assert.equal((await route.GET(new Request('http://localhost/api?userId=victim'))).status,401);
  assert.equal((await route.PATCH(request({displayName:'Attacker'}))).status,401);
 }finally{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old;}
});
test('geolocation validates bounds and computes finite distance',()=>{
 assert.throws(()=>rules.coordinates(100,0));assert.throws(()=>rules.coordinates(0,Infinity));assert.equal(rules.distanceKm({latitude:41,longitude:29},{latitude:41,longitude:29}),0);
 assert.ok(rules.distanceKm({latitude:41,longitude:29},{latitude:40,longitude:29})>100);
 assert.equal(rules.containsContact('0\u200B5\u200B5\u200B5\u200B1\u200B2\u200B3\u200B4\u200B5\u200B6\u200B7'),true);
});
