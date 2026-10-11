const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
function load(file,overrides={}) {
 const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>overrides[name]??(name==='@/lib/platform/server'?{requireProfession:async()=>({legalName:'Verified teacher'})}:require(name)),Buffer,Response,Request,URL,Error,Date,console,process});return exports;
}
const rules=load('src/lib/education/academy-rules.ts',{'@/types/payment':{LIFEOS_CREDIT_RATE_KURUS:200}});
const server=load('src/lib/education/academy-server.ts',{
 'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status??200})}},
 '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'auth-student'}}})}})},
 '@/lib/prisma':{prisma:{user:{findUnique:async query=>{assert.equal(query.where.supabaseId,'auth-student');return{id:'student'};}},professionApplication:{findFirst:async query=>{assert.equal(query.where.userId,'student');assert.equal(query.where.status,'approved');assert.equal(query.where.profession,'teacher');return null;}}}},
});
test('100 credits cost 220 TL, and tuition credits split 90/10 without minting money',()=>{
 const quote=rules.purchaseQuote(100);assert.equal(quote.baseKurus,20000);assert.equal(quote.commissionKurus,2000);assert.equal(quote.totalKurus,22000);
 const split=rules.tuitionSplit(100000);assert.equal(split.teacherMilli,90000);assert.equal(split.commissionMilli,10000);assert.equal(split.grossMilli,split.teacherMilli+split.commissionMilli);
 for(const invalid of [0,-1,1.2,Infinity,100001])assert.throws(()=>rules.purchaseQuote(invalid));
 for(const price of [0,1,999,12345,100000000]){const item=rules.tuitionSplit(price);assert.equal(item.grossMilli,item.teacherMilli+item.commissionMilli);}
});
test('daily access uses Istanbul midnight; monthly access is 30 days with no renewal',()=>{
 assert.equal(rules.accessExpiry('daily',new Date('2026-10-11T20:59:00Z')).toISOString(),'2026-10-11T21:00:00.000Z');
 assert.equal(rules.accessExpiry('daily',new Date('2026-10-11T21:01:00Z')).toISOString(),'2026-10-12T21:00:00.000Z');
 assert.equal(rules.accessExpiry('monthly',new Date('2026-10-11T12:00:00Z')).toISOString(),'2026-11-10T12:00:00.000Z');
});
test('teacher authority cannot be supplied as a request role or user ID',async()=>{
 const old=process.env.NEXT_PUBLIC_SUPABASE_URL;process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
 try{const session=await server.academySession(new Request('http://localhost/api?userId=teacher&role=instructor'));assert.equal(session.owner.id,'student');assert.equal(session.canTeach,false);
 await assert.rejects(()=>server.academySession(new Request('http://localhost/api',{method:'POST',headers:{origin:'https://foreign.example'}})),e=>e.status===403);
 }finally{if(old===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=old;}
});
test('JSON size is bounded even with missing Content-Length',async()=>{
 await assert.rejects(()=>server.academyBody(new Request('http://localhost/api',{method:'POST',body:' '.repeat(150001)})),e=>e.status===413);
 await assert.rejects(()=>server.academyBody(new Request('http://localhost/api',{method:'POST',body:'[]'})),e=>e.status===400);
 assert.equal((await server.academyBody(new Request('http://localhost/api',{method:'POST',body:'{"title":"Math"}'}))).title,'Math');
});
function fixture(options={}) {
 let state={wallets:{student:100000,other:100000,teacher:0},members:[],charges:[]};let actor='student';
 const classroom={mode:options.mode??'physical',id:'math',ownerId:'teacher',capacity:2,dailyMilli:100000,monthlyMilli:1000000,archived:false};
 const prisma={academyCharge:{findUnique:async({where})=>state.charges.find(c=>c.key===where.key)},academyMember:{findUnique:async({where})=>state.members.find(m=>m.classId===where.classId_userId.classId&&m.userId===where.classId_userId.userId)},academyClass:{findUnique:async()=>classroom},$transaction:async(fn,config)=>{assert.equal(config.isolationLevel,'Serializable');const draft=structuredClone(state);
   const tx={creditEntry:{createMany:async()=>({count:2})},academyClass:{findUnique:async()=>classroom},academyCharge:{findUnique:async({where})=>draft.charges.find(c=>c.key===where.key),create:async({data})=>{if(options.failCharge)throw new Error('database failure');draft.charges.push(data);return data;}},
    creditAccount:{updateMany:async({where,data})=>{if((draft.wallets[where.userId]??0)<where.balanceMilli.gte)return{count:0};draft.wallets[where.userId]-=data.balanceMilli.decrement;return{count:1};},upsert:async({where,create,update})=>{draft.wallets[where.userId]=where.userId in draft.wallets?draft.wallets[where.userId]+update.balanceMilli.increment:create.balanceMilli;}},
    academyMember:{findUnique:async({where})=>draft.members.find(m=>m.classId===where.classId_userId.classId&&m.userId===where.classId_userId.userId),updateMany:async()=>({count:0}),findFirst:async({where})=>draft.members.find(m=>m.classId===where.classId&&m.seat===where.seat),upsert:async({create})=>{draft.members.push(create);return create;}}};
   const result=await fn(tx);state=draft;return result;}};
 const route=load('src/app/api/academy/route.ts',{'next/server':{NextResponse:{json:body=>({body,status:200})}},'@/lib/prisma':{prisma},'@/lib/education/academy-rules':rules,
  '@/lib/education/academy-server':{...server,academySession:async()=>({owner:{id:actor},canTeach:false})},'@/lib/education/BigBlueButtonProvider':{BigBlueButtonProvider:class{isConfigured(){return false;}}}});
 const enroll=(key,seat=1)=>route.POST(new Request('http://localhost/api',{method:'POST',body:JSON.stringify({action:'enroll',classId:'math',plan:'daily',seat,key,grossMilli:1,userId:'other',teacherId:'other'})}));
 return{enroll,state:()=>state,actor:value=>actor=value,mode:value=>classroom.mode=value};
}
test('duplicate enrolment debits once and credits exactly 90 to the teacher',async()=>{
 const f=fixture();assert.equal((await f.enroll('key-1')).status,200);assert.equal((await f.enroll('key-1')).status,200);
 assert.equal(f.state().wallets.student,0);assert.equal(f.state().wallets.teacher,90000);assert.equal(f.state().charges.length,1);assert.equal(f.state().charges[0].commissionMilli,10000);
});
test('a taken seat leaves the other student balance intact',async()=>{
 const f=fixture();await f.enroll('first');f.actor('other');const result=await f.enroll('second');assert.equal(result.status,409);assert.equal(result.body.error,'SEAT_TAKEN');assert.equal(f.state().wallets.other,100000);
});
test('enrollment failure rolls back both debit and instructor income',async()=>{
 const f=fixture({failCharge:true});assert.equal((await f.enroll('fails')).status,503);assert.equal(f.state().wallets.student,100000);assert.equal(f.state().wallets.teacher,0);assert.equal(f.state().members.length,0);
});
test('answer keys are validated and unanswered questions cannot become correct',()=>{
 const questions=rules.validateQuestions([{text:'2 + 2?',options:['4','5'],correct:0},{text:'3 + 3?',options:['5','6'],correct:1}]);
 assert.equal(rules.gradeAnswers(questions,{}),0);assert.equal(rules.gradeAnswers(questions,{'0':0}),50);assert.equal(rules.gradeAnswers(questions,{'0':0,'1':1}),100);
 assert.throws(()=>rules.validateQuestions([{text:'Bad',options:['x','y'],correct:2}]));
});
test('verified credit settlement cannot double issue credits or accept an amount mismatch',async()=>{
 let balance=0;const purchase={id:'purchase',userId:'student',credits:100,totalKurus:22000,status:'pending',providerReference:null};
 const credit=load('src/lib/education/academy-credit.ts',{'./academy-server':server,'./academy-rules':rules,'@/lib/prisma':{prisma:{$transaction:async fn=>fn({creditEntry:{create:async()=>({})},creditPurchase:{findUnique:async()=>purchase,update:async({data})=>Object.assign(purchase,data)},creditAccount:{upsert:async({create})=>{balance+=create.balanceMilli;}}})}}});
 await assert.rejects(()=>credit.settleVerifiedCreditPurchase('purchase',{reference:'ref',totalKurus:20000,currency:'TRY'}));assert.equal(balance,0);
 await credit.settleVerifiedCreditPurchase('purchase',{reference:'ref',totalKurus:22000,currency:'TRY'});await credit.settleVerifiedCreditPurchase('purchase',{reference:'ref',totalKurus:22000,currency:'TRY'});assert.equal(balance,100000);
 await assert.rejects(()=>credit.settleVerifiedCreditPurchase('purchase',{reference:'other',totalKurus:22000,currency:'TRY'}));
});

test('an unconfigured online class never debits tuition',async()=>{const f=fixture({mode:'online'});const result=await f.enroll('not-ready');assert.equal(result.status,503);assert.equal(result.body.error,'LIVE_NOT_CONFIGURED');assert.equal(f.state().wallets.student,100000);assert.equal(f.state().charges.length,0);});

test('a successful payment retry remains idempotent even if the live service later goes offline',async()=>{const f=fixture();await f.enroll('receipt');f.mode('online');assert.equal((await f.enroll('receipt')).status,200);assert.equal(f.state().charges.length,1);assert.equal(f.state().wallets.student,0);});

test('student exam start never exposes the answer key',async()=>{
 const exam={id:'exam',classId:'math',title:'Math Exam',durationMinutes:40,opensAt:new Date(Date.now()-1000),closesAt:new Date(Date.now()+3600000),questions:[{text:'2+2?',options:['4','5'],correct:0}]};
 const route=load('src/app/api/academy/route.ts',{'next/server':{NextResponse:{json:body=>({body,status:200})}},'@/lib/prisma':{prisma:{academyExam:{findUnique:async()=>exam},academyAttempt:{upsert:async()=>({id:'attempt',deadline:new Date(Date.now()+60000),submittedAt:null,answers:{}})}}},'@/lib/education/academy-rules':rules,'@/lib/education/academy-server':{...server,academySession:async()=>({owner:{id:'student'},canTeach:false}),classroomAccess:async(classId,userId)=>{assert.equal(classId,'math');assert.equal(userId,'student');}},'@/lib/education/BigBlueButtonProvider':{BigBlueButtonProvider:class{}}});
 const result=await route.POST(new Request('http://localhost/api',{method:'POST',body:JSON.stringify({action:'start-exam',examId:'exam'})}));
 assert.equal(result.status,200);assert.equal(result.body.questions[0].correct,undefined);assert.equal(result.body.questions[0].text,'2+2?');assert.equal(JSON.stringify(result.body).includes('correct'),false);
});
test('expired exams grade saved answers, ignoring a late correct answer',async()=>{
 let saved;
 const attempt={id:'attempt',userId:'student',deadline:new Date(Date.now()-1000),submittedAt:null,answers:{'0':1},exam:{questions:[{text:'2+2?',options:['4','5'],correct:0}]}};
 const route=load('src/app/api/academy/route.ts',{'next/server':{NextResponse:{json:body=>({body,status:200})}},'@/lib/prisma':{prisma:{$transaction:async fn=>fn({academyAttempt:{findFirst:async({where})=>{assert.equal(where.userId,'student');return attempt;},update:async({data})=>{saved=data;return{score:data.score,submittedAt:data.submittedAt};}}})}},'@/lib/education/academy-rules':rules,'@/lib/education/academy-server':{...server,academySession:async()=>({owner:{id:'student'},canTeach:false})},'@/lib/education/BigBlueButtonProvider':{BigBlueButtonProvider:class{}}});
 const result=await route.POST(new Request('http://localhost/api',{method:'POST',body:JSON.stringify({action:'submit-exam',attemptId:'attempt',answers:{'0':0}})}));
 assert.equal(result.status,200);assert.equal(result.body.item.score,0);assert.equal(saved.answers['0'],1);assert.ok(saved.submittedAt);
});
test('private class notes remain editable after membership ends, without permitting another owner',async()=>{
 let updated;
 const route=load('src/app/api/academy/route.ts',{'next/server':{NextResponse:{json:body=>({body,status:200})}},'@/lib/prisma':{prisma:{academyNote:{findFirst:async({where})=>{assert.equal(where.userId,'student');return where.id==='mine'?{id:'mine',classId:'math'}:null;},updateMany:async({where,data})=>{assert.equal(where.userId,'student');updated=data;return{count:1};}}}},'@/lib/education/academy-rules':rules,'@/lib/education/academy-server':{...server,academySession:async()=>({owner:{id:'student'},canTeach:false}),classroomAccess:async()=>{throw new Error('expired membership must not prevent editing an owned note');}},'@/lib/education/BigBlueButtonProvider':{BigBlueButtonProvider:class{}}});
 const body={action:'note',id:'mine',classId:'math',title:'Revision',content:'My own notes'};
 assert.equal((await route.POST(new Request('http://localhost/api',{method:'POST',body:JSON.stringify(body)}))).status,200);assert.equal(updated.classId,'math');
 assert.equal((await route.POST(new Request('http://localhost/api',{method:'POST',body:JSON.stringify({...body,id:'someone-else'})}))).status,404);
});
