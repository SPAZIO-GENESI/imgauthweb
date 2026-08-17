#!/usr/bin/env node
// P50 — genera la versione Markdown delle home (IT/EN) a partire dall'HTML.
//
// Serve alla negoziazione di contenuto: una Rewrite Rule Cloudflare riscrive il
// percorso a `index.md` quando la richiesta porta `Accept: text/markdown`, così
// un agente riceve markdown sulla stessa URL, con HTTP 200 e il Content-Type
// giusto (GitHub Pages serve i .md come text/markdown). Il piano gratuito non ha
// la conversione automatica del provider (richiede Pro), e gli Snippets non
// esistono su Free: questa è la via praticabile a costo zero.
//
// ⚠️ GENERATO, mai scritto a mano. Un gemello scritto a mano divergerebbe dalla
// pagina alla prima modifica — è l'errore che questo progetto ha già pagato con
// le pagine parallele, il footer duplicato e il contratto API rimasto indietro.
// La guardia .github/workflows/markdown-twins-drift.yml rigenera e fallisce se
// l'output committato non combacia.
//
// ⚠️ Nessuna dipendenza: imgauthweb non ha package.json per scelta (P41) e non
// deve acquisirne uno per questo. Conversione a regex su un HTML noto e
// controllato, non un parser generico.
//
// Uso:  node scripts/build-markdown-twins.mjs            (scrive)
//       node scripts/build-markdown-twins.mjs --check    (esce 1 se disallineato)
import { readFileSync, writeFileSync } from "node:fs";

const check = process.argv.includes("--check");

const PAGES = [
  {
    html: "index.html",
    md: "index.md",
    lang: "it",
    intro: [
      "> Questa è la resa testuale di una pagina interattiva: i comandi (scelta del",
      "> file, campi, pulsanti) qui non esistono. Per usare il servizio da un",
      "> programma, le risorse scritte per le macchine sono più adatte:",
      ">",
      "> - istruzioni operative: <https://attestazione.spaziogenesi.org/.well-known/agent-skills/index.json>",
      "> - credenziali: <https://attestazione.spaziogenesi.org/auth.md>",
      "> - contratto API: <https://imgauth.spaziogenesi.org/openapi.json>",
      "> - mappa del sito: <https://attestazione.spaziogenesi.org/llms.txt>",
    ],
  },
  {
    html: "en/index.html",
    md: "en/index.md",
    lang: "en",
    intro: [
      "> This is a text rendition of an interactive page: the controls (choosing a",
      "> file, form fields, buttons) do not exist here. To use the service from a",
      "> program, the machine-oriented resources are a better fit:",
      ">",
      "> - operating instructions: <https://attestazione.spaziogenesi.org/.well-known/agent-skills/index.json>",
      "> - credentials: <https://attestazione.spaziogenesi.org/auth.md>",
      "> - API contract: <https://imgauth.spaziogenesi.org/openapi.json>",
      "> - site map: <https://attestazione.spaziogenesi.org/llms.txt>",
    ],
  },
];

const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
   .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
   .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–").replace(/&hellip;/g, "…")
   .replace(/&([a-z]+|#\d+);/gi, " ");

function convert(html) {
  // 1. Solo la parte di contenuto: dalla hero alla fine del main. Il footer è
  //    solo navigazione, già coperta da llms.txt.
  const start = html.indexOf('<header class="hero"');
  const end = html.indexOf("</main>");
  if (start < 0 || end < 0) throw new Error("hero o main non trovati: struttura della pagina cambiata");
  let s = html.slice(start, end);

  // 2. Via tutto ciò che non è contenuto leggibile.
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of ["script", "style", "svg", "template", "noscript", "select", "textarea", "canvas"]) {
    s = s.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"), "");
  }
  s = s.replace(/<(input|img|source|track)\b[^>]*>/gi, "");
  // Elementi dichiarati non visibili agli assistivi: non sono contenuto.
  s = s.replace(/<([a-z]+)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Numeri dei passi (<span class="n">1</span>): decorazione dello stepper, in
  // markdown finirebbero come righe con una cifra sola.
  s = s.replace(/<span\b[^>]*class="n"[^>]*>[\s\S]*?<\/span>/gi, "");
  // Pulsanti della tablist: navigazione fra le schede della stessa pagina, che
  // in una resa testuale (dove le schede sono tutte presenti) non significano
  // nulla — diventerebbero tre parole isolate.
  s = s.replace(/<button\b[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/gi, "");

  // 3. Inline prima dei blocchi, così il testo interno sopravvive.
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, txt) => {
    const t = decode(txt.replace(/<[^>]+>/g, "")).trim();
    if (!t) return "";
    if (/^#/.test(href)) return t;                       // ancore interne: solo testo
    const url = href.startsWith("/") ? "https://attestazione.spaziogenesi.org" + href : href;
    return `[${t}](${url})`;
  });
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, _t, x) => `**${x.replace(/<[^>]+>/g, "").trim()}**`);
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, _t, x) => `*${x.replace(/<[^>]+>/g, "").trim()}*`);
  s = s.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (m, x) => "`" + decode(x.replace(/<[^>]+>/g, "")).trim() + "`");

  // 4. Blocchi → marcatori su riga propria.
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (m, x) => `\n\n# ${x}\n\n`);
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (m, x) => `\n\n## ${x}\n\n`);
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (m, x) => `\n\n### ${x}\n\n`);
  s = s.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (m, x) => `\n\n#### ${x}\n\n`);
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (m, x) => `\n- ${x}\n`);
  s = s.replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/gi, (m, x) => `\n\n**${x}**\n\n`);
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|section|header|ul|ol|details|figure|blockquote|tr|label|button)>/gi, "\n\n");

  // 5. Via i tag rimasti, poi normalizzazione.
  s = decode(s.replace(/<[^>]+>/g, ""));
  s = s.split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  // Righe di puro rumore residuo (marcatori vuoti prodotti da elementi svuotati).
  s = s.split("\n").filter((l) => !/^(#{1,4}|-|\*\*\*\*|\*\*)$/.test(l)).join("\n");
  return s.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

let failed = false;
for (const p of PAGES) {
  const body = convert(readFileSync(p.html, "utf8"));
  const out = p.intro.join("\n") + "\n\n" + body;
  if (check) {
    let current = null;
    try { current = readFileSync(p.md, "utf8"); } catch { /* assente */ }
    if (current !== out) {
      console.error(`✗ ${p.md} non corrisponde a ${p.html}: rigenera con "node scripts/build-markdown-twins.mjs".`);
      failed = true;
    } else {
      console.log(`✓ ${p.md} allineato a ${p.html}.`);
    }
  } else {
    writeFileSync(p.md, out);
    console.log(`✓ ${p.md} generato da ${p.html} (${out.length} caratteri).`);
  }
}

if (failed) {
  console.error("\nmarkdown twins: l'HTML è cambiato senza rigenerare il markdown.");
  process.exit(1);
}
