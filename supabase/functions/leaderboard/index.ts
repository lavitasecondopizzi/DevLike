import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

const json = (body:unknown,status=200) => new Response(JSON.stringify(body),{status,headers});

function validEntry(value:unknown):value is Record<string,unknown> {
  if(!value || typeof value!=="object") return false;
  const v=value as Record<string,unknown>;
  return typeof v.score==="number" && Number.isInteger(v.score) && v.score>=0
    && typeof v.nickname==="string" && v.nickname.trim().length>=1 && v.nickname.trim().length<=20
    && Array.isArray(v.team) && typeof v.commessa==="number" && Number.isInteger(v.commessa)
    && v.commessa>=1 && v.commessa<=999999
    && typeof v.tappa==="number" && Number.isInteger(v.tappa) && v.tappa>=0 && v.tappa<=6
    && typeof v.causaPerdita==="string" && v.causaPerdita.length>=1 && v.causaPerdita.length<=80
    && typeof v.difficolta==="number" && Number.isFinite(v.difficolta) && v.difficolta>=0.1 && v.difficolta<=99.9
    && Array.isArray(v.mazzo) && !!v.nuzlocke && typeof v.nuzlocke==="object";
}

function mapEntry(v:Record<string,unknown>) {
  return {
    score:v.score,
    nickname:(v.nickname as string).trim(),
    team:v.team,
    commessa:v.commessa,
    tappa:v.tappa,
    causa_perdita:v.causaPerdita,
    difficolta:v.difficolta,
    mazzo:v.mazzo,
    nuzlocke:v.nuzlocke
  };
}

Deno.serve(async req => {
  if(req.method==="OPTIONS") return new Response("ok",{headers});
  try {
    if(req.method==="GET"){
      const {data,error}=await supabase
        .from("leaderboard_runs")
        .select("score,nickname,team,commessa,tappa,causa_perdita,difficolta,mazzo,nuzlocke,created_at")
        .order("score",{ascending:false})
        .order("commessa",{ascending:false})
        .order("tappa",{ascending:false})
        .order("created_at",{ascending:true})
        .limit(100);
      if(error) return json({error:"READ_FAILED"},500);
      return json((data??[]).map(row=>({
        score:Number(row.score),nickname:row.nickname,team:row.team,commessa:row.commessa,tappa:row.tappa,
        causaPerdita:row.causa_perdita,difficolta:Number(row.difficolta),
        mazzo:row.mazzo,nuzlocke:row.nuzlocke,createdAt:row.created_at
      })));
    }
    if(req.method!=="POST") return json({error:"METHOD_NOT_ALLOWED"},405);
    const body=await req.json();
    if(!validEntry(body)) return json({error:"INVALID_ENTRY"},400);
    const {error}=await supabase.from("leaderboard_runs").insert(mapEntry(body));
    if(error) return json({error:"INSERT_FAILED"},500);
    return json({ok:true},201);
  } catch {
    return json({error:"BAD_REQUEST"},400);
  }
});
