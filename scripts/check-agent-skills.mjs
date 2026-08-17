#!/usr/bin/env node
// P50 — guardia anti-drift dell'indice delle agent skills.
//
// /.well-known/agent-skills/index.json dichiara, per ogni SKILL.md, lo SHA-256
// del file. Se il SKILL cambia e il digest no, l'indice diventa FALSO in
// silenzio: un agente che verifica l'integrità scarta la skill, e nessuno se ne
// accorge. È la stessa classe di bug di openapi.json fermo per tre rilasci
// (P34), quindi vale la stessa medicina: una guardia che fallisce in CI.
//
// Uso:
//   node scripts/check-agent-skills.mjs           verifica (esce 1 se disallineato)
//   node scripts/check-agent-skills.mjs --write   riallinea i digest nell'indice
//
// Il --write è deliberatamente esplicito: riallineare è una decisione, non un
// effetto collaterale del controllo.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const INDEX = ".well-known/agent-skills/index.json";
const BASE = "https://attestazione.spaziogenesi.org";
const write = process.argv.includes("--write");

const raw = readFileSync(INDEX, "utf8");
const index = JSON.parse(raw);

if (!Array.isArray(index.skills) || index.skills.length === 0) {
  console.error(`✗ ${INDEX} non dichiara alcuna skill.`);
  process.exit(1);
}

let failed = false;
let changed = false;

for (const skill of index.skills) {
  // Dall'URL pubblica al percorso nel repo: è l'unica fonte di verità del
  // percorso, così un URL sbagliato viene scoperto qui e non da un agente.
  if (!skill.url?.startsWith(`${BASE}/`)) {
    console.error(`✗ ${skill.name}: url deve iniziare con ${BASE}/ (trovato: ${skill.url}).`);
    failed = true;
    continue;
  }
  const path = skill.url.slice(BASE.length + 1);

  if (!existsSync(path)) {
    console.error(`✗ ${skill.name}: ${path} non esiste, ma è dichiarato nell'indice.`);
    failed = true;
    continue;
  }

  const actual = "sha256:" + createHash("sha256").update(readFileSync(path)).digest("hex");

  if (actual === skill.digest) {
    console.log(`✓ ${skill.name} — digest allineato.`);
    continue;
  }

  if (write) {
    skill.digest = actual;
    changed = true;
    console.log(`↻ ${skill.name} — digest riallineato a ${actual}.`);
  } else {
    console.error(
      `✗ ${skill.name}: ${path} è cambiato dopo l'ultimo allineamento.\n` +
      `  dichiarato: ${skill.digest}\n` +
      `  effettivo:  ${actual}\n` +
      `  → aggiorna l'indice con: node scripts/check-agent-skills.mjs --write`
    );
    failed = true;
  }
}

if (write && changed) {
  writeFileSync(INDEX, JSON.stringify(index, null, 2) + "\n");
  console.log(`\n${INDEX} aggiornato.`);
}

if (failed) {
  console.error("\nagent-skills drift: l'indice non descrive più i file che dichiara.");
  process.exit(1);
}
console.log("\nagent-skills: indice e skill allineati.");
