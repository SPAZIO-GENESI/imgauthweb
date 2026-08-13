(function(){
  "use strict";
  const svgNS = "http://www.w3.org/2000/svg";

  /* ============ DATA ============ */
  const bands = [
    { key:'people', title:'Persone & enti', cat:'people', perRow:5, nodes:[
      { id:'p-org', label:['Spazio Genesi','ETS'], sub:'organizzazione', url:'https://spaziogenesi.org' },
      { id:'p-gestore', label:['Gestore'], sub:'it@spaziogenesi.org', url:'mailto:it@spaziogenesi.org' },
      { id:'p-federico', label:['Federico'], sub:'Presidente ETS', locked:true },
      { id:'p-manuela', label:['Manuela','Valloscuro'], sub:'design logo', url:'https://manuelavalloscuro.spaziogenesi.org' },
      { id:'p-radixia', label:['Radixia srl'], sub:'revisore esterno', url:'https://www.radixia.ai' },
    ]},
    { key:'channel', title:'Canali per l’utente e gli agenti AI', cat:'channel', perRow:6, nodes:[
      { id:'c-sito', label:['Sito web'], sub:'browser · full privacy', url:'https://attestazione.spaziogenesi.org' },
      { id:'c-bot', label:['Bot Telegram'], sub:'@SGAttestBot', url:'https://t.me/SGAttestBot' },
      { id:'c-cli', label:['CLI sg-attest'], sub:'terminale · CI', url:'https://www.npmjs.com/package/@spazio-genesi/attest-mcp' },
      { id:'c-action', label:['GitHub Action'], sub:'attest-action', url:'https://github.com/SPAZIO-GENESI/attest-action' },
      { id:'c-mcp', label:['MCP stdio'], sub:'agenti locali', url:'https://github.com/SPAZIO-GENESI/attest-mcp' },
      { id:'c-mcpremote', label:['MCP remoto'], sub:'zero installazione', url:'https://attest-mcp-remote.it-e3f.workers.dev/mcp' },
    ]},
    { key:'page', title:'Pagine e superfici pubbliche', cat:'page', perRow:6, nodes:[
      { id:'s-home', label:['Home'], sub:'attestazione.spaziogenesi.org', url:'https://attestazione.spaziogenesi.org' },
      { id:'s-condizioni', label:['/condizioni/'], sub:'fasce di utilizzo', url:'https://attestazione.spaziogenesi.org/condizioni/' },
      { id:'s-developer', label:['/developer/'], sub:'API · chiavi · CLI', url:'https://attestazione.spaziogenesi.org/developer/' },
      { id:'s-professionale', label:['/professionale/'], sub:'abbonamento', url:'https://attestazione.spaziogenesi.org/professionale/' },
      { id:'s-profilo', label:['/profilo/'], sub:'area personale', url:'https://attestazione.spaziogenesi.org/profilo/' },
      { id:'s-status', label:['/status/'], sub:'stato dei servizi', url:'https://attestazione.spaziogenesi.org/status/' },
      { id:'s-sicurezza', label:['/sicurezza/'], sub:'responsible disclosure', url:'https://attestazione.spaziogenesi.org/sicurezza/' },
      { id:'s-integrazioni', label:['/integrazioni/'], sub:'vetrina partner', url:'https://attestazione.spaziogenesi.org/integrazioni/' },
      { id:'s-changelog', label:['/changelog/'], sub:'cronologia rilasci', url:'https://attestazione.spaziogenesi.org/changelog/' },
      { id:'s-docs', label:['/docs/'], sub:'Swagger UI', url:'https://attestazione.spaziogenesi.org/docs/' },
      { id:'s-en', label:['/en/'], sub:'versione inglese', url:'https://attestazione.spaziogenesi.org/en/' },
      { id:'s-imgauth', label:['imgauth'], sub:'motore · API', url:'https://imgauth.spaziogenesi.org/openapi.json' },
      { id:'s-cpage', label:['/c/<hash>'], sub:'certificato pubblico', url:'https://attestazione.spaziogenesi.org/c/898ec96815e6bee1f85f93651fb64b6d1ad289510f4ac2fd9fbaa92fe01de452' },
      { id:'s-agentauth', label:['/agent/','authorize'], sub:'device flow MCP', locked:true },
      { id:'s-admin', label:['/admin'], sub:'pannello credenziali', url:'https://imgauth.spaziogenesi.org/admin' },
      { id:'s-authart', label:['authart'], sub:'firma PDF · Azure', url:'https://sgart.azurewebsites.net' },
      { id:'s-trust', label:['Trust Center'], sub:'trust.spaziogenesi.org', url:'https://trust.spaziogenesi.org' },
      { id:'s-whitepaper', label:['whitepaper'], sub:'documento tecnico', url:'https://trust.spaziogenesi.org/whitepaper.html' },
    ]},
    { key:'repo', title:'Repository (codice)', cat:'repo', perRow:5, nodes:[
      { id:'r-imgauthweb', label:['imgauthweb'], sub:'MIT · sito', url:'https://github.com/SPAZIO-GENESI/imgauthweb' },
      { id:'r-imgauth', label:['imgauth'], sub:'AGPL-3.0 · motore', url:'https://github.com/SPAZIO-GENESI/imgauth' },
      { id:'r-autart', label:['autart-signer'], sub:'firma PDF', url:'https://github.com/SPAZIO-GENESI/autart-signer' },
      { id:'r-gtf', label:['gtf'], sub:'registro trasparenza', url:'https://github.com/SPAZIO-GENESI/gtf' },
      { id:'r-attestmcp', label:['attest-mcp'], sub:'MIT · MCP + CLI', url:'https://github.com/SPAZIO-GENESI/attest-mcp' },
      { id:'r-attestmcpremote', label:['attest-mcp-','remote'], sub:'MCP remoto', url:'https://github.com/SPAZIO-GENESI/attest-mcp-remote' },
      { id:'r-attestbot', label:['attest-bot'], sub:'bot Telegram', url:'https://github.com/SPAZIO-GENESI/attest-bot' },
      { id:'r-attestaction', label:['attest-action'], sub:'GitHub Action', url:'https://github.com/SPAZIO-GENESI/attest-action' },
      { id:'r-attestazionestaging', label:['attestazione-','staging'], sub:'ambiente di prova', url:'https://spazio-genesi.github.io/attestazione-staging/' },
      { id:'r-hub', label:['img-auth-hub'], sub:'privato · coordinamento', locked:true },
    ]},
    { key:'infra', title:'Infrastruttura e servizi esterni', cat:'infra', perRow:6, nodes:[
      { id:'i-cloudflare', label:['Cloudflare'], sub:'Workers · R2 · D1', url:'https://www.cloudflare.com' },
      { id:'i-azure', label:['Azure'], sub:'Web App', url:'https://azure.microsoft.com' },
      { id:'i-github', label:['GitHub'], sub:'Pages · Actions · OIDC', url:'https://github.com' },
      { id:'i-backblaze', label:['Backblaze B2'], sub:'backup offsite EU', url:'https://www.backblaze.com' },
      { id:'i-stripe', label:['Stripe'], sub:'abbonamenti', url:'https://stripe.com' },
      { id:'i-opentimestamps', label:['OpenTimestamps'], sub:'ancoraggio Bitcoin', url:'https://opentimestamps.org' },
      { id:'i-digicert', label:['DigiCert'], sub:'marca temporale TSA', url:'https://www.digicert.com' },
      { id:'i-oauth', label:['OAuth'], sub:'Google · MS · LinkedIn', locked:true },
      { id:'i-telegram', label:['Telegram'], sub:'Bot API', url:'https://core.telegram.org/bots/api' },
      { id:'i-mcpregistry', label:['MCP Registry'], sub:'server pubblici', url:'https://registry.modelcontextprotocol.io/v0/servers?search=io.github.SPAZIO-GENESI/attest-mcp' },
      { id:'i-npm', label:['npm'], sub:'registro pacchetti', url:'https://www.npmjs.com/package/@spazio-genesi/attest-mcp' },
    ]},
  ];

  const edges = [
    // flow — the attestation pipeline
    ['c-sito','s-imgauth','flow','hash + HMAC'],
    ['c-bot','s-imgauth','flow',null],
    ['c-cli','s-imgauth','flow',null],
    ['c-mcp','s-imgauth','flow',null],
    ['c-mcpremote','s-imgauth','flow',null],
    ['s-imgauth','s-authart','flow','firma PDF'],
    ['s-authart','i-digicert','flow','marca temporale'],
    ['s-imgauth','i-opentimestamps','flow','ancora Bitcoin'],
    ['s-imgauth','s-cpage','flow','archivia + pubblica'],
    ['s-imgauth','i-cloudflare','flow','Worker · R2 · D1'],
    // call — pages/clients calling the API
    ['c-action','c-cli','call','usa'],
    ['s-home','s-imgauth','call',null],
    ['s-developer','s-imgauth','call',null],
    ['s-profilo','s-imgauth','call',null],
    ['s-professionale','s-imgauth','call',null],
    ['s-docs','s-imgauth','call',null],
    ['s-agentauth','s-imgauth','call',null],
    ['s-admin','s-imgauth','call',null],
    ['s-imgauth','i-stripe','call','abbonamenti'],
    ['s-imgauth','i-oauth','call','verifica email'],
    // deploy — repo -> live surface
    ['r-imgauthweb','s-home','deploy','deploy'],
    ['r-imgauth','s-imgauth','deploy','wrangler deploy'],
    ['r-autart','s-authart','deploy','deploy Azure'],
    ['r-gtf','s-trust','deploy','deploy'],
    ['r-attestmcpremote','c-mcpremote','deploy','deploy'],
    ['r-attestbot','c-bot','deploy','deploy'],
    ['r-attestmcp','c-mcp','deploy','npm publish'],
    ['r-attestaction','c-action','deploy','publish'],
    // host — hosted on / uses infra
    ['r-imgauthweb','i-github','host','Pages'],
    ['r-gtf','i-github','host','Pages'],
    ['r-attestazionestaging','i-github','host','Pages'],
    ['c-mcpremote','i-cloudflare','host','Worker'],
    ['c-bot','i-cloudflare','host','Worker'],
    ['s-authart','i-azure','host','Web App'],
    ['i-github','i-mcpregistry','host','OIDC publish'],
    ['r-attestmcp','i-npm','host','pubblica'],
    ['i-cloudflare','i-backblaze','host','backup notturno'],
    // govern — GTF registers evidence about the other repos
    ['r-gtf','r-imgauth','govern','registra evidenze'],
    ['r-gtf','r-imgauthweb','govern',null],
    ['r-gtf','r-autart','govern',null],
    // own — people and the org
    ['p-gestore','r-hub','own',null],
    ['p-gestore','p-org','own',null],
    ['p-federico','r-hub','own','contributor'],
    ['p-federico','r-gtf','own','controlli settimanali'],
    ['p-manuela','r-imgauthweb','own','logo'],
    ['p-radixia','r-gtf','own','review'],
    ['p-org','c-sito','own','gestisce'],
  ];

  // adiacenza diretta (simmetrica): usata per "mostra connessioni" al clic
  const adjacency = new Map();
  edges.forEach(([from,to])=>{
    if(!adjacency.has(from)) adjacency.set(from, new Set());
    if(!adjacency.has(to)) adjacency.set(to, new Set());
    adjacency.get(from).add(to);
    adjacency.get(to).add(from);
  });

  /* ============ LAYOUT ============ */
  const NODE_W = 220, NODE_H = 80;
  const GAP_X = NODE_W, GAP_Y = NODE_W; // minimo: mai meno della larghezza di un riquadro
  const X0 = 55, HEADER_H = 30, HEADER_GAP = 22, BAND_PAD_BOTTOM = 76;
  const TOP_MARGIN = 42, BOTTOM_MARGIN = 40;

  let y = TOP_MARGIN, maxRowWidth = 0;
  const nodeById = new Map();

  bands.forEach(band=>{
    const perRow = band.perRow;
    const rowWidth = perRow*NODE_W + (perRow-1)*GAP_X;
    maxRowWidth = Math.max(maxRowWidth, rowWidth);
    band.headerY = y;
    const gridY = y + HEADER_H + HEADER_GAP;
    band.nodes.forEach((n,i)=>{
      const row = Math.floor(i/perRow), col = i%perRow;
      n.x = X0 + col*(NODE_W+GAP_X);
      n.y = gridY + row*(NODE_H+GAP_Y);
      n.w = NODE_W; n.h = NODE_H;
      n.cx = n.x + NODE_W/2; n.cy = n.y + NODE_H/2;
      n.cat = band.cat;
      nodeById.set(n.id, n);
    });
    const rows = Math.ceil(band.nodes.length/perRow);
    const gridHeight = rows*NODE_H + (rows-1)*GAP_Y;
    band.ruleY = band.headerY + HEADER_H - 6;
    band.gridBottom = gridY + gridHeight;
    y = band.gridBottom + BAND_PAD_BOTTOM;
  });

  const W = X0*2 + maxRowWidth;
  const H = (y - BAND_PAD_BOTTOM) + BOTTOM_MARGIN;

  /* ============ RENDER ============ */
  const svg = document.getElementById('canvas');
  const viewport = document.getElementById('viewport');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  function el(tag, attrs){
    const e = document.createElementNS(svgNS, tag);
    if(attrs) for(const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // band chrome (drawn first, under everything)
  bands.forEach(band=>{
    const label = el('text', { x:X0, y:band.headerY + HEADER_H*0.62, class:'band-title' });
    label.textContent = band.title;
    viewport.appendChild(label);
    const rule = el('line', { x1:X0, x2:X0+maxRowWidth, y1:band.ruleY, y2:band.ruleY, class:'band-rule' });
    viewport.appendChild(rule);
  });

  // edges (under nodes)
  function anchor(n, side){
    switch(side){
      case 'top': return { x:n.cx, y:n.y };
      case 'bottom': return { x:n.cx, y:n.y+n.h };
      case 'left': return { x:n.x, y:n.cy };
      case 'right': return { x:n.x+n.w, y:n.cy };
    }
  }
  function cubicPoints(a,b){
    const dx=b.cx-a.cx, dy=b.cy-a.cy, p=[];
    let p0,p1,p2,p3;
    if(Math.abs(dy) >= Math.abs(dx)){
      p0 = dy>=0 ? anchor(a,'bottom') : anchor(a,'top');
      p3 = dy>=0 ? anchor(b,'top') : anchor(b,'bottom');
      const my = (p0.y+p3.y)/2;
      p1 = { x:p0.x, y:my }; p2 = { x:p3.x, y:my };
    } else {
      p0 = dx>=0 ? anchor(a,'right') : anchor(a,'left');
      p3 = dx>=0 ? anchor(b,'left') : anchor(b,'right');
      const mx = (p0.x+p3.x)/2;
      p1 = { x:mx, y:p0.y }; p2 = { x:mx, y:p3.y };
    }
    return [p0,p1,p2,p3];
  }
  function pathD(pts){
    const [p0,p1,p2,p3] = pts;
    return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;
  }
  function bezierAt(pts,t){
    const [p0,p1,p2,p3] = pts, mt=1-t;
    const a=mt*mt*mt, b=3*mt*mt*t, c=3*mt*t*t, d=t*t*t;
    return { x:a*p0.x+b*p1.x+c*p2.x+d*p3.x, y:a*p0.y+b*p1.y+c*p2.y+d*p3.y };
  }

  const edgeRecords = [];
  edges.forEach(([fromId,toId,style,label])=>{
    const a = nodeById.get(fromId), b = nodeById.get(toId);
    if(!a || !b) return;
    const pts = cubicPoints(a,b);
    const path = el('path', {
      d: pathD(pts),
      class: `edge edge-${style}`,
      'marker-end': style==='flow' ? 'url(#arrow-flow)' : 'url(#arrow-muted)'
    });
    viewport.appendChild(path);
    const record = { from:fromId, to:toId, els:[path] };
    if(label){
      const mid = bezierAt(pts, 0.5);
      const approxW = Math.max(30, label.length*5.6 + 10);
      const bg = el('rect', { x:mid.x-approxW/2, y:mid.y-8, width:approxW, height:14, rx:4, class:'elabel-bg' });
      const txt = el('text', { x:mid.x, y:mid.y+3, class:'elabel' });
      txt.textContent = label;
      viewport.appendChild(bg);
      viewport.appendChild(txt);
      record.els.push(bg, txt);
    }
    edgeRecords.push(record);
  });

  // nodes
  function labelYs(nLines, hasSub){
    if(nLines===1 && !hasSub) return { lines:[44], sub:null };
    if(nLines===1 && hasSub)  return { lines:[33], sub:57 };
    if(nLines===2 && !hasSub) return { lines:[36,52], sub:null };
    return { lines:[27,43], sub:63 }; // 2 lines + sub
  }

  bands.forEach(band=>{
    band.nodes.forEach(n=>{
      const hasSub = !!n.sub;
      const wrap = el('g', {
        transform:`translate(${n.x},${n.y})`,
        class:`node cat-${n.cat}${n.locked?' locked':''}`,
        tabindex:'0',
        role:'button'
      });
      wrap.dataset.id = n.id;
      wrap.dataset.cat = n.cat;
      wrap.dataset.search = (n.label.join(' ') + ' ' + (n.sub||'') + ' ' + n.id).toLowerCase();
      wrap.dataset.cx = n.cx; wrap.dataset.cy = n.cy;
      const baseName = n.label.join(' ') + (n.sub ? ' — ' + n.sub : '');
      wrap.setAttribute('aria-label', baseName + ' — mostra le connessioni dirette');

      const title = el('title', {});
      title.textContent = baseName + (n.locked ? ' — interno, senza link diretto' : ' — clic per le connessioni, icona ↗ per aprire');
      wrap.appendChild(title);

      wrap.appendChild(el('rect', { class:'box', width:n.w, height:n.h, rx:11 }));
      wrap.appendChild(el('rect', { class:'bar', x:0, y:0, width:5, height:n.h, rx:2.5 }));

      const ys = labelYs(n.label.length, hasSub);
      const text = el('text', { x:n.w/2, class:'label' });
      n.label.forEach((ln,i)=>{
        const tspan = el('tspan', { x:n.w/2, y:ys.lines[i] });
        tspan.textContent = ln;
        text.appendChild(tspan);
      });
      wrap.appendChild(text);

      if(hasSub){
        const sub = el('text', { x:n.w/2, y:ys.sub, class:'sub' });
        sub.textContent = n.sub;
        wrap.appendChild(sub);
      }

      if(n.url){
        // affordance separata: il clic sul riquadro seleziona/mostra connessioni,
        // solo questa piccola icona apre davvero la risorsa in una nuova scheda
        const linkBtn = el('a', {
          href:n.url, target:'_blank', rel:'noopener noreferrer', class:'openlink',
          'aria-label':'Apri ' + n.label.join(' ') + ' in una nuova scheda'
        });
        linkBtn.appendChild(el('circle', { cx:n.w-17, cy:17, r:11, class:'openlink-bg' }));
        const arrow = el('text', { x:n.w-17, y:21, class:'openlink-icon' });
        arrow.textContent = '↗';
        linkBtn.appendChild(arrow);
        wrap.appendChild(linkBtn);
      }
      if(n.locked){
        const lock = el('text', { x:n.w-17, y:21, class:'lock', 'text-anchor':'middle' });
        lock.textContent = '🔒';
        wrap.appendChild(lock);
      }

      wrap.addEventListener('keydown', e=>{
        if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          toggleFocus(n.id);
        }
      });

      viewport.appendChild(wrap);
    });
  });

  /* ============ PAN / ZOOM ============ */
  let scale = 1, tx = 0, ty = 0;
  function apply(){
    viewport.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`);
    document.getElementById('zlabel').textContent = Math.round(scale*100) + '%';
  }
  function clamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }

  function zoomAt(outerX, outerY, factor){
    const newScale = clamp(scale*factor, 0.4, 3.2);
    const worldX = (outerX - tx) / scale, worldY = (outerY - ty) / scale;
    tx = outerX - worldX*newScale;
    ty = outerY - worldY*newScale;
    scale = newScale;
    apply();
  }

  function clientToOuter(clientX, clientY){
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if(!ctm) return { x:0, y:0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x:p.x, y:p.y };
  }

  svg.addEventListener('wheel', e=>{
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0016);
    const o = clientToOuter(e.clientX, e.clientY);
    zoomAt(o.x, o.y, factor);
  }, { passive:false });

  // pointer-based pan (mouse + touch) with drag-vs-click detection, plus basic pinch.
  // Selection is resolved from pointerdown's hit-test, not from a later "click" event:
  // once setPointerCapture runs, some browsers retarget the synthetic click to the
  // <svg> itself instead of the box that was actually pressed, so clicks silently
  // did nothing. Resolving the target node up front sidesteps that entirely.
  const pointers = new Map();
  let panBase = null;      // { startClientX, startClientY, startTx, startTy, k, moved }
  let pinchBase = null;    // { distStart, midOuter, scaleStart, txStart, tyStart }
  let pressedNodeId = null;
  let pressedOnLink = false;

  function currentK(){
    const ctm = svg.getScreenCTM();
    return ctm ? 1/ctm.a : 1;
  }
  function twoPointerInfo(){
    const pts = [...pointers.values()];
    const dx = pts[0].x-pts[1].x, dy = pts[0].y-pts[1].y;
    const dist = Math.hypot(dx,dy);
    const midClient = { x:(pts[0].x+pts[1].x)/2, y:(pts[0].y+pts[1].y)/2 };
    return { dist, midOuter: clientToOuter(midClient.x, midClient.y) };
  }

  svg.addEventListener('pointerdown', e=>{
    if(pointers.size === 0){
      const nodeEl = e.target.closest ? e.target.closest('.node') : null;
      const linkEl = e.target.closest ? e.target.closest('a.openlink') : null;
      pressedOnLink = !!linkEl;
      pressedNodeId = (nodeEl && !pressedOnLink) ? nodeEl.dataset.id : null;
    }
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if(pointers.size === 1){
      panBase = { startClientX:e.clientX, startClientY:e.clientY, startTx:tx, startTy:ty, k:currentK(), moved:false };
      svg.classList.add('panning');
    } else if(pointers.size === 2){
      panBase = null;
      const info = twoPointerInfo();
      pinchBase = { distStart: Math.max(info.dist,1), midOuter: info.midOuter, scaleStart: scale, txStart: tx, tyStart: ty };
    }
  });

  svg.addEventListener('pointermove', e=>{
    if(!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });

    if(pointers.size === 2 && pinchBase){
      const info = twoPointerInfo();
      const ratio = info.dist / pinchBase.distStart;
      const newScale = clamp(pinchBase.scaleStart * ratio, 0.4, 3.2);
      const worldX = (pinchBase.midOuter.x - pinchBase.txStart) / pinchBase.scaleStart;
      const worldY = (pinchBase.midOuter.y - pinchBase.tyStart) / pinchBase.scaleStart;
      tx = pinchBase.midOuter.x - worldX*newScale;
      ty = pinchBase.midOuter.y - worldY*newScale;
      scale = newScale;
      apply();
      return;
    }
    if(pointers.size === 1 && panBase){
      const dxC = e.clientX - panBase.startClientX, dyC = e.clientY - panBase.startClientY;
      if(Math.hypot(dxC,dyC) > 4) panBase.moved = true;
      tx = panBase.startTx + dxC*panBase.k;
      ty = panBase.startTy + dyC*panBase.k;
      apply();
    }
  });

  function endPointer(){
    if(pointers.size < 2) pinchBase = null;
    if(pointers.size === 1){
      const [remaining] = [...pointers.values()];
      panBase = { startClientX:remaining.x, startClientY:remaining.y, startTx:tx, startTy:ty, k:currentK(), moved:false };
    }
    if(pointers.size === 0){
      panBase = null;
      svg.classList.remove('panning');
    }
  }

  svg.addEventListener('pointerup', e=>{
    const wasSingle = pointers.size === 1;
    const moved = wasSingle && panBase && panBase.moved;
    pointers.delete(e.pointerId);
    endPointer();
    if(wasSingle && !moved){
      if(pressedNodeId) toggleFocus(pressedNodeId);
      else if(!pressedOnLink) clearFocus();
    }
    pressedNodeId = null;
    pressedOnLink = false;
  });
  svg.addEventListener('pointercancel', e=>{
    pointers.delete(e.pointerId);
    endPointer();
    pressedNodeId = null;
    pressedOnLink = false;
  });

  document.getElementById('zoomIn').addEventListener('click', ()=> zoomAt(W/2, H/2, 1.25));
  document.getElementById('zoomOut').addEventListener('click', ()=> zoomAt(W/2, H/2, 0.8));
  document.getElementById('zoomReset').addEventListener('click', ()=>{ scale=1; tx=0; ty=0; apply(); });

  apply();

  /* ============ SEARCH / CATEGORY FILTER / FOCUS SU CONNESSIONI ============ */
  const allCats = ['people','channel','page','repo','infra'];
  let activeCats = new Set(allCats);
  let focusId = null;
  const chips = [...document.querySelectorAll('.chip')];
  const searchInput = document.getElementById('search');

  function updateVisibility(){
    const q = searchInput.value.trim().toLowerCase();
    const connected = focusId ? (adjacency.get(focusId) || new Set()) : null;

    document.querySelectorAll('.node').forEach(node=>{
      const id = node.dataset.id, cat = node.dataset.cat;
      const passesFilter = activeCats.has(cat) && (!q || node.dataset.search.includes(q));
      let dim = !passesFilter;
      if(focusId && id !== focusId && !connected.has(id)) dim = true;
      node.classList.toggle('dim', dim);
      node.classList.toggle('focus-active', id === focusId);
    });

    edgeRecords.forEach(rec=>{
      const involved = focusId && (rec.from === focusId || rec.to === focusId);
      rec.els.forEach(elm=>{
        elm.classList.toggle('dim', !!focusId && !involved);
        elm.classList.toggle('lit', !!involved);
      });
    });

    chips.forEach(chip=>{
      chip.classList.toggle('active', activeCats.size < allCats.length && activeCats.has(chip.dataset.cat));
    });
  }

  function toggleFocus(id){
    focusId = (focusId === id) ? null : id;
    updateVisibility();
  }
  function clearFocus(){
    if(!focusId) return;
    focusId = null;
    updateVisibility();
  }

  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const cat = chip.dataset.cat;
      if(activeCats.size === allCats.length){
        activeCats = new Set([cat]);
      } else if(activeCats.has(cat)){
        activeCats.delete(cat);
        if(activeCats.size === 0) activeCats = new Set(allCats);
      } else {
        activeCats.add(cat);
      }
      updateVisibility();
    });
  });

  searchInput.addEventListener('input', updateVisibility);
  searchInput.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      const first = [...document.querySelectorAll('.node')].find(node => !node.classList.contains('dim'));
      if(first){
        const cx = +first.dataset.cx, cy = +first.dataset.cy;
        scale = 1.5;
        tx = W/2 - cx*scale;
        ty = H/2 - cy*scale;
        apply();
      }
    }
  });

  // il clic sullo sfondo deseleziona già dentro il gestore 'pointerup' qui sopra
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape') clearFocus(); });
})();
