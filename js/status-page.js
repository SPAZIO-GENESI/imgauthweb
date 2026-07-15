  const WORKER_BASE = "https://imgauth.spaziogenesi.org";
  const STATE_LABEL = { ok: "operativo", down: "non disponibile", degraded: "rallentato", nodata: "in raccolta dati" };
  const BANNER_TEXT = {
    ok: "Tutti i sistemi operativi",
    degraded: "Disservizio parziale in corso",
    down: "Disservizio in corso",
    nodata: "Stato in raccolta dati",
  };

  // (a) Cosa monitoriamo e come, in parole semplici — per componente.
  const SERVICE_DESC = {
    worker: "Il <strong>motore</strong> che calcola l'impronta digitale (SHA-256) dei file e prepara l'attestazione. Lo consideriamo operativo se risponde alle richieste.",
    signer: "Il servizio che <strong>firma digitalmente</strong> il certificato PDF. Controlliamo ogni pochi minuti che risponda (può avere un avvio lento dopo un periodo di inattività). Se non è disponibile, l'attestazione in formato testo (.txt) resta scaricabile, ma non il PDF firmato.",
    archive: "Lo <strong>spazio di conservazione</strong> (Cloudflare R2, con dati nell'Unione Europea) dove custodiamo i certificati e le prove, per poterli recuperare tramite impronta. Controlliamo che sia raggiungibile.",
    anchor: "La registrazione dell'impronta nella <strong>blockchain di Bitcoin</strong> tramite i calendar pubblici OpenTimestamps. Controlliamo che almeno uno dei calendar risponda. È una garanzia <em>aggiuntiva</em> e a prova di guasto: se i calendar sono lenti, il certificato viene comunque emesso (senza la riga OpenTimestamps), quindi un eventuale «rallentato» qui <strong>non interrompe</strong> il servizio.",
  };

  // (b) Spiegazione per stato, per la finestra di dettaglio del giorno.
  const DAY_EXPLAIN = {
    _default: {
      ok: "Operativo per l'intera giornata, nessun problema rilevato.",
      nodata: "Nessun dato raccolto in questa giornata.",
    },
    worker: {
      down: "Il motore non rispondeva: in quei momenti il servizio poteva essere inaccessibile.",
      degraded: "Il motore ha risposto con rallentamenti.",
    },
    signer: {
      down: "Il firmatario non rispondeva: il PDF firmato poteva non essere generato (l'impronta e il .txt restavano comunque disponibili).",
      degraded: "Il firmatario ha risposto lentamente (possibile avvio a freddo): qualche emissione di PDF poteva tardare.",
    },
    archive: {
      down: "L'archivio non era raggiungibile: il recupero dei certificati tramite impronta poteva non funzionare temporaneamente.",
      degraded: "L'archivio ha risposto con rallentamenti.",
    },
    anchor: {
      down: "Nessun calendar OpenTimestamps raggiungibile: i certificati emessi in quel momento uscivano senza la riga di ancoraggio Bitcoin (recuperabile in seguito). Il resto del servizio non era interessato.",
      degraded: "Uno o più calendar OpenTimestamps hanno risposto lentamente. L'ancoraggio resta garantito dagli altri calendar: nessuna interruzione del servizio (è una garanzia aggiuntiva, a prova di guasto).",
    },
  };

  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let _hist = null; // ultimo storico, per la finestra di dettaglio del giorno

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("it-IT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" }) + " (ora italiana)";
  }
  function fmtDayIt(ymd) {
    const [y, m, g] = ymd.split("-");
    return `${g}/${m}/${y}`;
  }

  const norm = (v) => (["ok", "down", "degraded"].includes(v) ? v : "nodata");

  // Stato attuale complessivo dai dati LIVE (/api/status): peggiore tra i critici.
  function overallFromLive(s) {
    let o = "ok";
    for (const k of ["worker", "signer", "archive"]) {
      const v = norm(s[k]);
      if (v === "down") o = "down";
      else if (v === "degraded" && o !== "down") o = "degraded";
      else if (v === "nodata" && o === "ok") o = "nodata";
    }
    return o;
  }

  // live = /api/status (stato ADESSO, ~3 min) · hist = /api/status-history (barre 90 gg)
  function render(live, hist) {
    _hist = hist;
    const banner = document.getElementById("banner");
    const bannerText = document.getElementById("bannerText");
    const overall = live ? overallFromLive(live) : (hist ? hist.overall : "nodata");
    banner.className = "banner " + (overall || "nodata");
    bannerText.textContent = BANNER_TEXT[overall] || BANNER_TEXT.nodata;

    const cont = document.getElementById("components");
    cont.innerHTML = "";
    const comps = (hist && hist.components) ? hist.components : [];
    for (const c of comps) {
      // Stato ATTUALE del componente: dal live se disponibile, altrimenti dal rollup di oggi.
      const cur = norm(live && live[c.key] ? live[c.key] : c.current);

      const wrap = document.createElement("div");
      wrap.className = "comp";

      const head = document.createElement("div");
      head.className = "comp-head";
      const nameWrap = document.createElement("span");
      const name = document.createElement("span");
      name.className = "comp-name";
      name.textContent = c.label;
      const info = document.createElement("button");
      info.className = "comp-info";
      info.type = "button";
      info.textContent = "?";
      info.setAttribute("aria-label", "Cosa monitoriamo e come");
      nameWrap.appendChild(name); nameWrap.appendChild(info);
      const state = document.createElement("span");
      state.className = "comp-state " + cur;
      state.textContent = STATE_LABEL[cur] || STATE_LABEL.nodata;
      head.appendChild(nameWrap); head.appendChild(state);

      // (a) pannello descrittivo a tendina, per questo servizio
      const desc = document.createElement("div");
      desc.className = "comp-desc";
      desc.innerHTML = SERVICE_DESC[c.key] || "";
      info.addEventListener("click", () => desc.classList.toggle("open"));

      const bars = document.createElement("div");
      bars.className = "bars";
      for (const day of c.days) {
        const b = document.createElement("div");
        const s = day.s || "nodata";
        b.className = "bar " + s;
        b.title = fmtDayIt(day.d) + " — " + (STATE_LABEL[s] || STATE_LABEL.nodata) +
          (s !== "nodata" ? " · clicca per il dettaglio" : "");
        if (s !== "nodata") {                       // (b) cliccabile solo se ha dati
          b.classList.add("clickable");
          b.addEventListener("click", () => openDay(day.d, c.key, c.label));
        }
        bars.appendChild(b);
      }

      const meta = document.createElement("div");
      meta.className = "bars-meta";
      const left = document.createElement("span");
      left.textContent = (hist ? hist.window_days : 90) + " giorni fa";
      const mid = document.createElement("span");
      mid.className = "uptime";
      mid.textContent = (c.uptime === null || c.uptime === undefined) ? "uptime — (dati in raccolta)" : ("uptime " + c.uptime + "%");
      const right = document.createElement("span");
      right.textContent = "oggi";
      meta.appendChild(left); meta.appendChild(mid); meta.appendChild(right);

      wrap.appendChild(head); wrap.appendChild(desc); wrap.appendChild(bars); wrap.appendChild(meta);
      cont.appendChild(wrap);
    }

    const liveTime = live && live.checked_at ? fmtDate(live.checked_at) : "—";
    document.getElementById("updated").textContent =
      "Stato attuale al " + liveTime + " · le barre mostrano lo storico giornaliero (90 giorni)";
  }

  // (b) Finestra di dettaglio: SOLO il servizio selezionato, nel giorno selezionato.
  function openDay(dateStr, compKey, compLabel) {
    if (!_hist || !_hist.components) return;
    const c = _hist.components.find((x) => x.key === compKey);
    const label = compLabel || (c ? c.label : compKey);
    document.getElementById("dayTitle").textContent = label + " — " + fmtDayIt(dateStr);
    const day = c ? (c.days || []).find((x) => x.d === dateStr) : null;
    const s = (day && day.s) ? day.s : "nodata";
    const exp = (DAY_EXPLAIN[compKey] && DAY_EXPLAIN[compKey][s]) || DAY_EXPLAIN._default[s] || "";
    document.getElementById("dayBody").innerHTML =
      '<div class="day-row"><div class="dr-head"><span class="dot ' + s + '"></span>' +
      'Esito del giorno — <span class="comp-state ' + s + '">' +
      (STATE_LABEL[s] || STATE_LABEL.nodata) + '</span></div>' +
      (exp ? '<div class="dr-exp">' + esc(exp) + '</div>' : '') + '</div>';
    document.getElementById("dayModal").classList.add("open");
    loadDayEvents(dateStr, compKey, label); // (c) eventi fini SOLO di questo componente
  }

  // (c) Carica e mostra gli eventi fini del giorno (rallentamenti, degradi, errori)
  // da /api/health-log. Compaiono anche nei giorni "verdi": un rallentamento sotto
  // soglia non degrada il servizio ma viene registrato per l'analisi.
  const CHECK_LABEL = { archive: "Archivio", signer: "Firma PDF", anchor: "Ancoraggio Bitcoin", worker: "Motore" };
  const CAUSE_LABEL = { slow: "rallentamento", timeout: "timeout", r2_error: "errore archivio", all_unreachable: "calendar irraggiungibili" };
  function evDotClass(e) {
    if (e.status === "error") return "down";
    if (e.status === "degraded") return "degraded";
    if (e.cause === "slow") return "degraded"; // ok-ma-lento: pallino giallo tenue
    return "ok";
  }
  function evStateText(e) {
    if (e.status === "error") return "errore";
    if (e.status === "degraded") return "rallentato";
    if (e.cause === "slow") return "lento (entro soglia)";
    return "ok";
  }
  async function loadDayEvents(dateStr, compKey, compLabel) {
    const box = document.getElementById("dayEvents");
    const name = compLabel || CHECK_LABEL[compKey] || compKey;
    const title = '<div class="ev-title">Eventi registrati — ' + esc(name) + '</div>';
    box.innerHTML = title + '<div class="ev-note">Caricamento…</div>';
    // Il motore non ha una latenza misurata: è monitorato solo come raggiungibile o no.
    if (compKey === "worker") {
      box.innerHTML = title + '<div class="ev-note">Questo componente è monitorato solo come raggiungibile o non raggiungibile: non registra rallentamenti.</div>';
      return;
    }
    let data = null;
    try {
      data = await fetch(WORKER_BASE + "/api/health-log?day=" + encodeURIComponent(dateStr), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null));
    } catch {}
    if (!data) { box.innerHTML = title + '<div class="ev-note err">Dettaglio degli eventi non disponibile al momento.</div>'; return; }
    // SOLO gli eventi di questo componente, così il dettaglio non è ambiguo.
    const evs = (data.events || []).filter((e) => e.check === compKey);
    if (!evs.length) {
      box.innerHTML = title + '<div class="ev-note">Nessun rallentamento o disservizio registrato per questo componente: giornata regolare.</div>';
      return;
    }
    let html = '<div class="ev-title">Eventi — ' + esc(name) + ' (' + evs.length + ')</div>';
    for (const e of evs) {
      const t = new Date(e.ts).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome" });
      const cause = e.cause ? " · " + (CAUSE_LABEL[e.cause] || e.cause) : "";
      const lat = (e.latency != null ? " · " + e.latency + " ms" : "");
      html += '<div class="ev-row"><span class="dot ' + evDotClass(e) + '"></span>' +
        '<span class="ev-time">' + esc(t) + '</span> ' +
        '<span class="ev-state">' + esc(evStateText(e)) + '</span>' +
        '<span class="ev-lat">' + esc(lat + cause) + '</span></div>';
    }
    box.innerHTML = html;
  }
  (function () {
    const modal = document.getElementById("dayModal");
    const close = () => modal.classList.remove("open");
    document.getElementById("dayClose").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  })();

  async function load() {
    let live = null, hist = null;
    try {
      const [a, b] = await Promise.all([
        fetch(WORKER_BASE + "/api/status", { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(WORKER_BASE + "/api/status-history", { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      live = a; hist = b;
    } catch {}
    if (!live && !hist) {
      document.getElementById("bannerText").textContent = "Stato non disponibile in questo momento.";
      document.getElementById("banner").className = "banner nodata";
      document.getElementById("updated").innerHTML = '<span class="err">Impossibile contattare il servizio di stato.</span>';
      return;
    }
    render(live, hist);
  }

  load();
  setInterval(load, 180000); // ricontrolla ogni 3 minuti (stato attuale near-real-time)
  document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
