#!/usr/bin/env node
// P29 FASE 2: rigenera integrazioni/index.html + integrazioni/logo/* a partire
// da GET /api/integrations (JSON pubblico di imgauth). Eseguito SOLO dal
// workflow build-integrazioni.yml (repository_dispatch/cron/manuale) — mai a
// runtime del sito: zero chiamate al Worker per visita.
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync, readFileSync } from "node:fs";
import { join } from "node:path";

const API      = process.env.INTEGRATIONS_API_URL || "https://imgauth.spaziogenesi.org/api/integrations";
const OUT_DIR  = "integrazioni";
const LOGO_DIR = join(OUT_DIR, "logo");
const PAGE_URL = "https://attestazione.spaziogenesi.org/integrazioni/";

function escHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const res = await fetch(API);
if (!res.ok) throw new Error(`GET /api/integrations -> HTTP ${res.status}`);
const { items } = await res.json();

mkdirSync(LOGO_DIR, { recursive: true });

// Scarica i loghi delle candidature correnti; tiene traccia dei nomi file
// scritti per poter ripulire quelli orfani (candidature rimosse/rifiutate
// dall'ultima generazione) subito dopo.
const keep = new Set();
const cards = [];
for (const item of items) {
  let logoRel = null;
  if (item.logo_url) {
    const logoRes = await fetch(item.logo_url);
    if (logoRes.ok) {
      const ct = logoRes.headers.get("content-type") || "";
      const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
      const filename = `${item.id}.${ext}`;
      const bytes = Buffer.from(await logoRes.arrayBuffer());
      writeFileSync(join(LOGO_DIR, filename), bytes);
      logoRel = `/integrazioni/logo/${filename}`;
      keep.add(filename);
    }
  }
  cards.push({ ...item, logoRel });
}

if (existsSync(LOGO_DIR)) {
  for (const f of readdirSync(LOGO_DIR)) {
    if (!keep.has(f)) unlinkSync(join(LOGO_DIR, f));
  }
}

const cardsHtml = cards
  .map(
    (r) => `
      <div class="intcard">
        ${r.logoRel ? `<img class="intlogo" src="${r.logoRel}" alt="" loading="lazy">` : `<div class="intlogo intlogo-ph" aria-hidden="true"></div>`}
        <h2>${escHtml(r.app_name)}</h2>
        <p>${escHtml(r.description)}</p>
        <a href="${escHtml(r.url)}" target="_blank" rel="noopener nofollow">${escHtml(r.url)}</a>
      </div>`
  )
  .join("");

const count = cards.length;
const lead = `${count} applicazion${count === 1 ? "e" : "i"} di terzi integra${count === 1 ? "" : "no"} l'attestazione Spazio Genesi. La presenza qui non è una certificazione del software: verifica sempre autonomamente prima di usarlo.`;

const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Integrazioni e applicazioni — Attestazione | Spazio Genesi</title>
<meta name="description" content="Applicazioni, bot e servizi di terzi che integrano l'attestazione delle opere digitali di Spazio Genesi.">
<link rel="canonical" href="${PAGE_URL}">
<meta name="robots" content="index, follow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<meta property="og:title" content="Integrazioni e applicazioni — Attestazione | Spazio Genesi">
<meta property="og:description" content="Applicazioni, bot e servizi di terzi che integrano l'attestazione delle opere digitali di Spazio Genesi.">
<meta property="og:image" content="https://attestazione.spaziogenesi.org/og.png">
<meta property="og:url" content="${PAGE_URL}">
<meta property="og:type" content="website">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Attestazione", "item": "https://attestazione.spaziogenesi.org/" },
    { "@type": "ListItem", "position": 2, "name": "Integrazioni e applicazioni", "item": "${PAGE_URL}" }
  ]
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --oro: #8B6914; --bg:#faf8f4; --card:#fff; --ink:#1a1a1a; --muted:#6b6453; --line:#e7e1d4; }
  body { font-family: 'Inter', system-ui, sans-serif; font-weight: 300; background: var(--bg); color: var(--ink); line-height: 1.6; }
  header { text-align: center; padding: 2.6rem 1.5rem 0; }
  header h1 { font-family: 'EB Garamond', Georgia, serif; font-size: clamp(1.7rem, 4vw, 2.3rem); font-weight: 400; }
  header h1 span { font-style: italic; color: var(--oro); }
  .sub { margin-top: 0.6rem; font-size: 0.85rem; color: #777; max-width: 640px; margin-left: auto; margin-right: auto; }
  .divider { width: 48px; height: 1.5px; background: var(--oro); margin: 1.4rem auto 0; }
  main { max-width: 1000px; margin: 0 auto; padding: 2.2rem 1.5rem 3rem; }
  .muted { color: var(--muted); font-size: 0.86rem; margin-top: 0.6rem; }
  .muted a { color: var(--oro); text-decoration: none; }
  .muted a:hover { text-decoration: underline; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; margin-top: 1.6rem; }
  .intcard { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 1.2rem; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
  .intcard h2 { font-family: 'EB Garamond', Georgia, serif; font-weight: 500; font-size: 1.05rem; margin: 0.6rem 0 0.4rem; }
  .intcard p { font-size: 0.88rem; color: var(--ink); margin: 0.2rem 0 0.6rem; }
  .intcard a { font-size: 0.82rem; word-break: break-all; color: var(--oro); }
  .intlogo { width: 88px; height: 88px; object-fit: contain; border-radius: 10px; background: #fff; border: 1px solid var(--line); padding: 0.4rem; }
  .intlogo-ph { background: #f2f0ea; }

  footer { padding: 2rem 1.5rem 2.2rem; font-size: 0.78rem; color: #aaa; border-top: 1px solid #eee; margin-top: 1rem; }
  footer a { color: #888; text-decoration: none; }
  footer a:hover { text-decoration: underline; }
  .footer-inner { max-width: 1000px; margin: 0 auto; text-align: center; }
  .footer-back { display: block; margin-bottom: 1rem; }
  .footer-cols { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.6rem 2.6rem; margin: 0 0 1.3rem; text-align: left; }
  .footer-col { min-width: 150px; }
  .footer-col h3 { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.06em; color: #999; font-weight: 600; margin-bottom: 0.5rem; }
  .footer-col a { display: block; margin: 0.35rem 0; }
  .footer-bottom { padding-top: 1rem; border-top: 1px solid #f0f0ee; }
  @media (max-width: 480px) { .footer-cols { text-align: center; justify-content: space-around; } }
</style>

<!-- Matomo (sg-matomo) -->
<script src="/js/matomo-sg.js"></script>
<!-- End Matomo Code -->
</head>
<body>

<!-- Barra del servizio: logo Attestazione + rimando all'ente -->
<style>
  .sg-brandbar{ display:flex; align-items:center; justify-content:space-between; gap:.6rem 1.5rem;
    flex-wrap:wrap; max-width:64rem; margin:0 auto; padding:1rem 1.5rem 0;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
  .sg-brandbar .svc{ display:inline-flex; align-items:center; gap:.5rem; text-decoration:none;
    font-size:1rem; font-weight:600; color:#211E15; letter-spacing:.01em; }
  .sg-brandbar .svc svg{ width:26px; height:26px; display:block; flex:0 0 auto; }
  .sg-brandbar .svc:hover{ color:#6E5310; }
  .sg-brandbar .parent{ display:inline-flex; align-items:center; gap:.35rem; text-decoration:none;
    font-size:.72rem; color:#8C8672; }
  .sg-brandbar .parent svg{ width:13px; height:auto; display:block; }
  .sg-brandbar .parent:hover{ color:#6E5310; }
</style>
<div class="sg-brandbar">
  <a class="svc" href="/" aria-label="Attestazione — home del servizio">
    <svg viewBox="0 0 700 700" aria-hidden="true"><path fill="#8B6914" d="M0,0 L700,0 L700,196.81 L597.87,196.81 L597.87,102.13 L102.13,102.13 L102.13,597.87 L597.87,597.87 L597.87,503.19 L700,503.19 L700,700 L0,700 Z"/><circle fill="#211E15" cx="350" cy="350" r="153.19"/><rect fill="#211E15" x="490.53" y="291.49" width="209.44" height="117.03"/></svg>
    <span>Attestazione</span>
  </a>
  <a class="parent" href="https://spaziogenesi.org/" title="Spazio Genesi — l'ente dietro il servizio">
    <svg viewBox="0 0 580 481" aria-hidden="true"><g transform="translate(0,481) scale(0.1,-0.1)" fill="currentColor" stroke="none"><path d="M2175 4799 c-729 -75 -1378 -467 -1780 -1074 -82 -124 -203 -366 -252 -505 -100 -282 -137 -506 -137 -815 0 -222 6 -283 46 -497 l23 -118 1396 0 1397 0 26 -83 c37 -117 49 -216 43 -332 -24 -405 -299 -739 -698 -847 -120 -32 -328 -32 -448 0 -105 29 -210 76 -301 138 -77 51 -201 176 -240 242 l-25 41 -368 1 -368 0 63 -76 c142 -172 345 -355 533 -479 124 -82 366 -203 505 -252 281 -100 505 -137 815 -137 310 0 534 37 815 137 139 49 381 170 505 252 265 175 514 425 690 690 94 141 214 391 269 558 l49 147 534 0 533 0 0 565 0 565 -1944 0 -1943 0 -27 59 c-53 119 -70 203 -70 361 0 168 18 251 84 388 51 106 88 161 169 246 83 86 166 145 275 197 142 66 218 82 391 82 122 0 165 -4 228 -21 99 -27 232 -89 310 -146 74 -52 190 -172 232 -238 l30 -48 413 0 c226 0 412 2 412 5 0 14 -172 214 -256 299 -190 190 -374 323 -619 447 -232 117 -479 196 -735 234 -127 19 -452 27 -575 14z"/></g></svg>
    <span>un servizio di Spazio Genesi ↗</span>
  </a>
</div>

<header>
  <h1>Integrazioni e <span>applicazioni</span></h1>
  <p class="sub">Chi ha costruito un'app, un bot o un servizio che integra l'attestazione — con o senza convenzione — può candidarsi qui. La pubblicazione è verificata a mano dal gestore.</p>
  <div class="divider"></div>
</header>

<main>
  <p class="muted">${lead} Hai costruito un'integrazione? <a href="/profilo/">Candidala dal tuo profilo</a>.</p>
  <div class="grid">${cardsHtml || '<p class="muted">Nessuna integrazione pubblicata ancora.</p>'}</div>
</main>

<footer>
  <div class="footer-inner">
    <a class="footer-back" href="/">← Torna al servizio di attestazione</a>
    <nav class="footer-cols" aria-label="Collegamenti del footer">
      <div class="footer-col">
        <h3>Servizio</h3>
        <a href="https://spaziogenesi.org/servizi#attestazione">Il servizio spiegato</a>
        <a href="https://t.me/SGAttestBot">Bot Telegram</a>
        <a href="/changelog/">Cronologia dei miglioramenti</a>
        <a href="/status/">Stato del servizio</a>
      </div>
      <div class="footer-col">
        <h3>Fasce e accesso</h3>
        <a href="/condizioni/">Fasce e condizioni</a>
        <a href="/professionale/">Fascia Professionale</a>
        <a href="/profilo/">Area professionale</a>
      </div>
      <div class="footer-col">
        <h3>Fiducia</h3>
        <a href="/privacy.html">Privacy</a>
        <a href="/sicurezza/">Segnala una vulnerabilità</a>
        <a href="https://attestazione.trust.spaziogenesi.org">Come verificarci</a>
      </div>
      <div class="footer-col">
        <h3>Sviluppatori</h3>
        <a href="/developer/">API &amp; server MCP</a>
        <a href="/developer/cli/">Eseguibile CLI</a>
        <a href="/integrazioni/">Vetrina Integrazioni</a>
      </div>
    </nav>
    <div class="footer-bottom">
      <a href="https://attestazione.trust.spaziogenesi.org"><img src="https://trust.spaziogenesi.org/badge.svg" alt="Genesis Trust Score" height="16" style="vertical-align:middle;"></a>
      <span>·</span>
      <a href="https://spaziogenesi.org">Spazio Genesi</a>
    </div>
  </div>
</footer>

</body>
</html>
`;

const outPath = join(OUT_DIR, "index.html");
const previous = existsSync(outPath) ? readFileSync(outPath, "utf8") : null;
writeFileSync(outPath, html);
console.log(`Generato ${outPath} con ${count} candidature (${previous === html ? "invariato" : "cambiato"}).`);
