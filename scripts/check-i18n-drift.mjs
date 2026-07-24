#!/usr/bin/env node
// P41 — guardia anti-divergenza IT/EN (CLAUDE.md § P41, decisione D2).
// Per ogni coppia in i18n/pairs.json, ricalcola lo SHA-256 del file italiano
// e lo confronta con it_sha256: se differisce, il file IT è cambiato dopo
// l'ultima traduzione allineata e il rilascio si ferma finché non si prende
// una decisione esplicita (tradurre l'EN, oppure ri-allineare l'hash
// dichiarando che la modifica non tocca il testo).
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

const { pairs } = JSON.parse(readFileSync("i18n/pairs.json", "utf8"));

let failed = false;
for (const { it, en, it_sha256 } of pairs) {
  if (!existsSync(it)) {
    console.error(`✗ ${it} non esiste più (coppia in i18n/pairs.json da aggiornare).`);
    failed = true;
    continue;
  }
  if (!existsSync(en)) {
    console.error(`✗ ${en} non esiste: la pagina EN dichiarata in i18n/pairs.json è assente.`);
    failed = true;
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(it)).digest("hex");
  if (actual !== it_sha256) {
    console.error(
      `✗ ${it} è cambiato dopo l'ultima traduzione: aggiorna ${en} e poi it_sha256 in i18n/pairs.json ` +
      `(atteso ${it_sha256}, trovato ${actual}).`
    );
    failed = true;
  } else {
    console.log(`✓ ${it} invariato dall'ultimo allineamento con ${en}.`);
  }
}

if (failed) {
  console.error("\ni18n drift: una o più coppie IT/EN non sono allineate.");
  process.exit(1);
}
console.log("\ni18n drift: tutte le coppie sono allineate.");
