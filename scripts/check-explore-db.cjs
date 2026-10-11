require('@next/env').loadEnvConfig(process.cwd());
const {Client}=require('pg');
const client=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:4000});
(async()=>{try{await client.connect();const result=await client.query("select to_regclass('public.users') is not null as users_ready, to_regclass('public.explore_posts') is not null as explore_ready");console.log(result.rows);}catch(error){console.log('Database verification failed:',error.code||error.name);}finally{await client.end().catch(()=>{});}})();
