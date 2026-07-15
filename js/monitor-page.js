  const BASE = "https://imgauth.spaziogenesi.org";
  const TZ = "Europe/Rome";
  const SVC = {
    signer:  { nm:"Firma PDF (Azure)",     k:"signer" },
    archive: { nm:"Archivio (R2)",         k:"archive" },
    anchor:  { nm:"Ancoraggio (OTS)",      k:"anchor" },
    worker:  { nm:"Motore",                k:"worker" },
  };
  const ORDER = ["worker","signer","archive","anchor"];
  const STATE_LBL = { ok:"operativo", down:"non disponibile", degraded:"rallentato", "n/d":"n/d", nodata:"n/d" };
  const CAUSE_LBL = { slow:"rallentamento", timeout:"timeout", r2_error:"errore archivio", all_unreachable:"calendar irraggiungibili" };

  const dayRome = (d=new Date()) => new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
  const timeRome = (ms) => new Date(ms).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:TZ});
  const shiftDay = (ymd,delta) => { const [y,m,d]=ymd.split("-").map(Number); return new Intl.DateTimeFormat("en-CA",{timeZone:"UTC",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(Date.UTC(y,m-1,d)+delta*86400000)); };
  const esc = (s)=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const norm = (v)=>(["ok","down","degraded"].includes(v)?v:"nodata");

  const $ = (id)=>document.getElementById(id);
  $("date").value = dayRome();

  async function jget(url){ try{ const r=await fetch(url,{cache:"no-store"}); return r.ok?await r.json():null; }catch{ return null; } }

  function renderStrip(live){
    const el=$("strip"); el.innerHTML="";
    for(const k of ORDER){
      const s = live ? norm(live[k]) : "nodata";
      el.insertAdjacentHTML("beforeend",
        '<div class="chip"><span class="dot '+s+'"></span><div><div class="nm">'+esc(SVC[k].nm)+
        '</div><div class="st">'+(STATE_LBL[s]||"n/d")+'</div></div></div>');
    }
  }

  function evTag(e){
    if(e.status==="error") return '<span class="tag error"><span class="d"></span>errore</span>';
    if(e.status==="degraded") return '<span class="tag degraded"><span class="d"></span>rallentato</span>';
    return '<span class="tag slow"><span class="d"></span>lento</span>';
  }

  function renderEvents(day, data){
    const box=$("events"), sum=$("summary");
    if(!data){ box.innerHTML='<p class="empty err">Dati non disponibili al momento.</p>'; sum.textContent=""; return; }
    const evs = (data.events||[]);
    if(!evs.length){
      sum.innerHTML='<b>0 eventi</b> il '+esc(day)+'. Nessun rallentamento o disservizio registrato: tutto regolare (o le soglie non sono ancora state superate).';
      box.innerHTML='<p class="empty">😌 Nessun evento in questa giornata.</p>'; return;
    }
    const by={}; let max=0,totLat=0,nLat=0;
    for(const e of evs){ by[e.check]=(by[e.check]||0)+1; if(e.latency!=null){ max=Math.max(max,e.latency); totLat+=e.latency; nLat++; } }
    const byTxt=Object.entries(by).map(([k,n])=>(SVC[k]?SVC[k].nm:k)+": "+n).join(" · ");
    sum.innerHTML='<b>'+evs.length+' eventi</b> il '+esc(day)+' — '+esc(byTxt)+
      ' · lat. max <b>'+max+'ms</b>'+(nLat?' · media '+Math.round(totLat/nLat)+'ms':'');
    let rows="";
    for(const e of evs){
      rows+='<tr><td>'+esc(timeRome(e.ts))+'</td><td>'+esc(SVC[e.check]?SVC[e.check].nm:e.check)+'</td><td>'+evTag(e)+
        '</td><td class="lat">'+(e.latency!=null?e.latency+' ms':'—')+'</td><td>'+esc(e.cause?(CAUSE_LBL[e.cause]||e.cause):'')+'</td></tr>';
    }
    box.innerHTML='<table><thead><tr><th>Ora</th><th>Servizio</th><th>Esito</th><th>Latenza</th><th>Causa</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }

  async function load(){
    const day=$("date").value||dayRome();
    const [live,log]=await Promise.all([ jget(BASE+"/api/status"), jget(BASE+"/api/health-log?day="+encodeURIComponent(day)) ]);
    renderStrip(live);
    renderEvents(day, log);
    $("updated").textContent="Ultimo aggiornamento: "+timeRome(Date.now())+" (ora italiana)"+(live&&live.checked_at?" · stato calcolato alle "+timeRome(Date.parse(live.checked_at)):"");
  }

  $("prev").onclick   = ()=>{ $("date").value=shiftDay($("date").value,-1); load(); };
  $("next").onclick   = ()=>{ $("date").value=shiftDay($("date").value,+1); load(); };
  $("today").onclick  = ()=>{ $("date").value=dayRome(); load(); };
  $("date").onchange  = load;
  $("refresh").onclick= load;

  let timer=null;
  function arm(){ if(timer) clearInterval(timer); if($("auto").checked) timer=setInterval(load,30000); }
  $("auto").onchange=arm;
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) load(); });

  load(); arm();
