import {createClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET,auth=req.headers.get('authorization')??'';
 if(!secret||Buffer.byteLength(auth)!==Buffer.byteLength('Bearer '+secret)||!timingSafeEqual(Buffer.from(auth),Buffer.from('Bearer '+secret)))return Response.json({error:'Unauthorized'},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return Response.json({error:'Scheduler is not configured'},{status:503});
 const db=createClient(url,key,{auth:{persistSession:false}});const {data,error}=await db.rpc('expire_store_orders');
 return error?Response.json({error:'Expiration job failed'},{status:500}):Response.json({expired:data});
}
