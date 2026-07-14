  /* ── Estensioni della proposta index2 (solo UI, nessuna logica di servizio) ── */

  // 1) Tablist ARIA: sincronizza aria-selected/tabindex a ogni cambio scheda
  //    e aggiunge la navigazione con le frecce (pattern WAI-ARIA "Tabs").
  (function () {
    const ordine = ["attesta", "verifica", "istruzioni"];
    const nomi = { attesta: "Attesta", verifica: "Verifica", istruzioni: "Istruzioni" };
    const btn = q => document.getElementById("tabBtn" + nomi[q]);

    function sincronizza() {
      ordine.forEach(k => {
        const b = btn(k);
        if (!b) return;
        const sel = b.classList.contains("attiva");
        b.setAttribute("aria-selected", sel ? "true" : "false");
        b.tabIndex = sel ? 0 : -1;
      });
    }

    const orig = window.mostraTab;
    window.mostraTab = function (quale) { orig(quale); sincronizza(); };
    sincronizza(); // stato iniziale (copre anche il deep-link ?hash= già gestito dal core)

    document.getElementById("navTabs").addEventListener("keydown", e => {
      const i = ordine.findIndex(k => btn(k) === document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === "ArrowRight") j = (i + 1) % ordine.length;
      else if (e.key === "ArrowLeft") j = (i + ordine.length - 1) % ordine.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = ordine.length - 1;
      if (j !== null) { e.preventDefault(); window.mostraTab(ordine[j]); btn(ordine[j]).focus(); }
    });
  })();

  // 2) L'impronta, dal vivo: SHA-256 della frase digitata, calcolata nel browser
  //    con WebCrypto — la stessa tecnologia usata per attestare le opere.
  (function () {
    // Desktop: demo sempre aperto (il vertice della tendina è nascosto via CSS).
    // Mobile: parte chiuso, per non frapporre testo tra il titolo e l'azione.
    const box = document.getElementById("demoBox");
    if (box) {
      const mq = window.matchMedia("(min-width: 841px)");
      const applica = () => { box.open = mq.matches; };
      applica();
      if (mq.addEventListener) mq.addEventListener("change", applica); else mq.addListener(applica);
    }
    const inp = document.getElementById("demoFrase");
    const out = document.getElementById("demoHash");
    if (!inp || !out || !(window.crypto && crypto.subtle)) return;
    let ultima = 0;
    async function aggiorna() {
      const mia = ++ultima;
      const dati = new TextEncoder().encode(inp.value || " ");
      const dig = await crypto.subtle.digest("SHA-256", dati);
      if (mia !== ultima) return; // scarta risposte fuori ordine
      const hex = Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2, "0")).join("");
      out.innerHTML = hex.match(/.{8}/g).map(g => "<span>" + g + "</span>").join("");
    }
    inp.addEventListener("input", aggiorna);
    aggiorna();
  })();
