  const WORKER_BASE       = "https://imgauth.spaziogenesi.org";
  // Base della pagina di verifica permanente /c/<hash> (servita dal Worker, montata
  // su questo dominio via route Cloudflare): stesso valore stampato nel certificato.
  const CERT_PAGE_BASE    = "https://attestazione.spaziogenesi.org";
  const WORKER_HASH_URL   = WORKER_BASE + "/api/hash";
  const WORKER_VERIFY_URL = WORKER_BASE + "/api/verify";
  const WORKER_PDF_URL    = WORKER_BASE + "/api/cert-pdf";

  // Turnstile: sitekey PUBBLICA del widget (creato in dashboard Cloudflare).
  // Le sitekey reali iniziano con "0x"; finché è il placeholder, l'anti-bot è inattivo.
  // Le sitekey di TEST documentate da Cloudflare (per ambienti di staging/collaudo,
  // MAI in produzione) usano i prefissi 1x/2x/3x — vedi CLAUDE.md § Turnstile.
  // Scoperto in P24 FASE 7: /^0x/ da solo escludeva anche le chiavi di test,
  // impedendo al widget di renderizzarsi affatto sull'ambiente di staging.
  const TURNSTILE_SITEKEY = "0x4AAAAAADiPceBIwTz5n4hG";
  const turnstileEnabled = () => /^[0-3]x/.test(TURNSTILE_SITEKEY);
  let tsRendered = false;
  function ensureTurnstile() {
    if (tsRendered || !turnstileEnabled() || !window.turnstile) return;
    const el = document.getElementById("turnstileWidget");
    if (!el) return;
    window.turnstile.render(el, { sitekey: TURNSTILE_SITEKEY, action: "genera-attestazione" });
    tsRendered = true;
  }
  // Chiamata da Turnstile quando l'API è pronta (vedi ?onload= nello <script>);
  // fallback su DOM pronto nel caso l'API risultasse già caricata.
  window.onloadTurnstileCallback = ensureTurnstile;
  document.addEventListener("DOMContentLoaded", ensureTurnstile);

  // --- "ATTESTA CON LA TUA EMAIL" — voucher stateless dal sito (P25 §2.7) ---
  // Nessun cookie né sessione server: il voucher firmato viaggia nel fragment
  // URL (mai inviato a un server), viene letto una volta e tenuto in
  // sessionStorage (sparisce alla chiusura della scheda). Il file continua a
  // non lasciare mai il dispositivo: il voucher riguarda solo l'IDENTITÀ di
  // chi attesta, non l'opera.
  const SG_VOUCHER_KEY = "sgVoucher";

  function base64UrlToStr(b64url) {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
    return decodeURIComponent(
      atob(b64).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  }
  function decodeVoucherPayload(token) {
    try {
      const dot = token.lastIndexOf(".");
      if (dot < 0) return null;
      return JSON.parse(base64UrlToStr(token.slice(0, dot)));
    } catch { return null; }
  }

  // Al primo load: un fragment #sgv= appena arrivato dal redirect OAuth vince
  // su un eventuale voucher già in sessionStorage (nuovo accesso esplicito).
  (function captureVoucherFromFragment() {
    const m = /(?:^|[#&])sgv=([^&]+)/.exec(location.hash);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    sessionStorage.setItem(SG_VOUCHER_KEY, token);
    history.replaceState(null, "", location.pathname + location.search);
  })();

  function getActiveVoucher() {
    const token = sessionStorage.getItem(SG_VOUCHER_KEY);
    if (!token) return null;
    const payload = decodeVoucherPayload(token);
    // Scadenza controllata anche lato client per la sola UI (il server la
    // riverifica comunque ad ogni /api/hash: qui evitiamo solo di mostrare
    // un banner "attivo" per un voucher già scaduto).
    if (!payload || !payload.email || Date.now() > payload.exp) {
      sessionStorage.removeItem(SG_VOUCHER_KEY);
      return null;
    }
    return { token, payload };
  }

  function renderVoucherState() {
    const active = getActiveVoucher();
    const anonBox  = document.getElementById("convenzioneAnon");
    const attivaBox = document.getElementById("convenzioneAttiva");
    const tsWidget  = document.getElementById("turnstileWidget");
    if (active) {
      anonBox.style.display = "none";
      attivaBox.style.display = "block";
      const testoEl = document.getElementById("convenzioneAttivaTesto");
      testoEl.textContent = "Stai attestando come " + active.payload.email;
      // Fascia effettiva dal server (Convenzione con X / Professionale /
      // Sviluppatore / Base): il payload del voucher è solo un hint.
      // Fail-safe: se la chiamata fallisce resta il testo neutro.
      fetch(WORKER_BASE + "/api/pro/me", { headers: { "X-SG-Voucher": active.token } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.contract && d.contract.label) {
            testoEl.textContent = "Stai attestando come " + active.payload.email +
              " — fascia: " + d.contract.label;
          }
        })
        .catch(() => {});
      if (tsWidget) tsWidget.style.display = "none";
    } else {
      anonBox.style.display = "";
      attivaBox.style.display = "none";
      if (tsWidget) tsWidget.style.display = "";
      ensureTurnstile();
    }
  }
  document.addEventListener("DOMContentLoaded", renderVoucherState);
  document.getElementById("convenzioneEsciBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SG_VOUCHER_KEY);
    renderVoucherState();
  });

  // Versione dell'interfaccia: sorgente di verità unica (vedi CLAUDE.md › Versioning).
  // Il footer mostra "interfaccia vX.Y.Z" e affianca la versione del motore letta da /ping.
  const APP_VERSION = "1.27.0";

  // Microdonazioni PayPal: incolla qui l'URL del bottone Donazioni
  // (es. "https://www.paypal.com/donate/?hosted_button_id=XXXXXXXX").
  // Finché è vuoto, il pulsantino resta nascosto.
  const PAYPAL_DONATE_URL = "https://www.paypal.com/ncp/payment/D6LB9W4BNVEA4";
  (function showDona() {
    if (!PAYPAL_DONATE_URL) return;
    document.getElementById("donaLink").href = PAYPAL_DONATE_URL;
    document.getElementById("donaRow").style.display = "block";
  })();

  // --- TAB ATTESTA / VERIFICA / ISTRUZIONI ---
  const TABS = { attesta: "Attesta", verifica: "Verifica", istruzioni: "Istruzioni" };
  function mostraTab(quale) {
    for (const [k, nome] of Object.entries(TABS)) {
      document.getElementById("tab" + nome).classList.toggle("tab-nascosta", quale !== k);
      document.getElementById("tabBtn" + nome).classList.toggle("attiva", quale === k);
    }
  }
  (function showVersion() {
    const el = document.getElementById("appVersion");
    if (!el) return;
    el.textContent = "interfaccia v" + APP_VERSION;
    fetch(WORKER_BASE + "/ping")
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d && d.version) el.textContent += " · motore v" + d.version; })
      .catch(() => {});
  })();


  // --- ELEMENTI GENERAZIONE HASH ---
  const fileInput   = document.getElementById("fileInput");
  const dropZone    = document.getElementById("dropZone");
  const previewRow  = document.getElementById("previewRow");
  const previewImg  = document.getElementById("previewImg");
  const previewName = document.getElementById("previewName");
  const previewMeta = document.getElementById("previewMeta");
  const attestBtn   = document.getElementById("attestBtn");
  const btnLabel    = document.getElementById("btnLabel");
  const errorMsg    = document.getElementById("errorMsg");
  const resultWrap  = document.getElementById("resultWrap");
  const downloadBtn = document.getElementById("downloadBtn");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");

  // --- ELEMENTI VERIFICA HASH ---
  const verifyFileInput   = document.getElementById("verifyFileInput");
  const verifyDropZone    = document.getElementById("verifyDropZone");
  const verifyPreviewRow  = document.getElementById("verifyPreviewRow");
  const verifyPreviewImg  = document.getElementById("verifyPreviewImg");
  const verifyPreviewName = document.getElementById("verifyPreviewName");
  const verifyPreviewMeta = document.getElementById("verifyPreviewMeta");
  const verifyHashInput    = document.getElementById("verifyHashInput");
  const verifyAttestInput  = document.getElementById("verifyAttestInput");
  const verifyHmacInput    = document.getElementById("verifyHmacInput");
  const verifyErrorMsg     = document.getElementById("verifyErrorMsg");
  const verifyBtn          = document.getElementById("verifyBtn");
  const verifyBtnLabel     = document.getElementById("verifyBtnLabel");
  const verifyResultWrap   = document.getElementById("verifyResultWrap");
  const verifyHashCalc     = document.getElementById("verifyHashCalc");

  let selectedFile = null;
  let lastData = null;
  let verifyFile = null;

  function fmt(b) {
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b/1024).toFixed(1) + " KB";
    return (b/1048576).toFixed(2) + " MB";
  }

  // Miniatura: immagine reale per i file immagine, altrimenti un'icona generica
  // con l'estensione (accettiamo file di qualsiasi formato).
  function fileIconDataUri(ext) {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>" +
      "<rect width='56' height='56' rx='4' fill='#eee' stroke='#ddd'/>" +
      "<text x='28' y='33' font-family='Inter,sans-serif' font-size='11' fill='#888' text-anchor='middle'>" +
      (ext || "FILE") + "</text></svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function setThumb(imgEl, f) {
    if (f.type && f.type.startsWith("image/")) {
      const fr = new FileReader();
      fr.onload = e => { imgEl.src = e.target.result; };
      fr.readAsDataURL(f);
    } else {
      const ext = (f.name.split(".").pop() || "").toUpperCase().slice(0, 5);
      imgEl.src = fileIconDataUri(ext);
    }
  }

  // --- CARICAMENTO FILE PRINCIPALE (HASH) ---
  // Tetto pratico: l'impronta si calcola in locale (WebCrypto, non streaming),
  // quindi il file va letto per intero in memoria. 1 GB è un limite prudente
  // per i browser correnti; il file NON viene comunque inviato al server.
  const MAX_FILE_BYTES = 1024 * 1024 * 1024;

  function loadFile(f) {
    if (f.size > MAX_FILE_BYTES) {
      selectedFile = null;
      attestBtn.disabled = true;
      previewRow.classList.remove("show");
      showErr("File troppo grande (max 1 GB). L'impronta si calcola nel tuo browser e serve memoria sufficiente a leggere il file.");
      return;
    }
    selectedFile = f;
    previewName.textContent = f.name;
    previewMeta.textContent = (f.type || "tipo sconosciuto") + " · " + fmt(f.size);
    setThumb(previewImg, f);
    previewRow.classList.add("show");
    attestBtn.disabled = false;
    resultWrap.classList.remove("show");
    errorMsg.classList.remove("show");
    lastData = null;
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
  });

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("over");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("over");
    const f = e.dataTransfer.files[0];
    if (f) {
      fileInput.files = e.dataTransfer.files;
      loadFile(f);
    }
  });

  // --- GENERAZIONE HASH / ATTESTAZIONE ---
  attestBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    // Voucher email attivo (P25 §2.7): bypassa la sola challenge Turnstile,
    // come un token anti-bot alternativo — barriera più forte (OAuth one-shot).
    const activeVoucher = getActiveVoucher();

    // Token anti-bot Turnstile: il worker lo richiede per emettere l'attestazione
    // — SALTATO se un voucher email valido è attivo.
    let tsToken = "";
    if (!activeVoucher && turnstileEnabled()) {
      tsToken = (window.turnstile && window.turnstile.getResponse()) || "";
      if (!tsToken) {
        showErr("Completa la verifica anti-bot qui sopra, poi riprova.");
        return;
      }
    }

    attestBtn.classList.add("loading");
    attestBtn.disabled = true;
    btnLabel.textContent = "Elaborazione…";
    errorMsg.classList.remove("show");
    resultWrap.classList.remove("show");

    try {
      // Full privacy (1.14.0): l'impronta SHA-256 si calcola QUI, nel browser
      // (WebCrypto). Il file non lascia mai questo dispositivo: al server
      // viaggiano solo impronta, nome/tipo/dimensione e i dati dichiarati.
      btnLabel.textContent = "Calcolo dell'impronta…";
      const sha256 = await sha256Hex(selectedFile);

      // Invia JSON al Worker. I dati dell'opera (facoltativi) vengono
      // normalizzati dal server e vincolati alla firma HMAC dell'attestazione.
      btnLabel.textContent = "Attestazione…";
      const hashHeaders = { "Content-Type": "application/json" };
      if (activeVoucher) hashHeaders["X-SG-Voucher"] = activeVoucher.token;
      const res = await fetch(WORKER_HASH_URL, {
        method: "POST",
        headers: hashHeaders,
        body: JSON.stringify({
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          sha256: sha256,
          turnstile_token: tsToken,
          titolo: document.getElementById("metaTitolo").value,
          autore: document.getElementById("metaAutore").value,
          anno:   document.getElementById("metaAnno").value,
          note:   document.getElementById("metaNote").value
        })
      });

      const d = await res.json();

      if (!res.ok) {
        if (d.error === "voucher_scaduto") {
          sessionStorage.removeItem(SG_VOUCHER_KEY);
          renderVoucherState();
          showErr("Il tuo accesso con email istituzionale è scaduto. Accedi di nuovo qui sopra, poi riprova.");
          return;
        }
        showErr(d.error || "Errore " + res.status);
        return;
      }

      lastData = d;
      // Auto-fill campi verifica HMAC con i dati appena calcolati.
      // I dati dichiarati arrivano dal server in forma canonica (normalizzata):
      // sono QUELLI i valori coperti dalla firma, da usare per la verifica.
      verifyAttestInput.value = d.attestazione || "";
      verifyHmacInput.value   = d.hmac || "";
      document.getElementById("vMetaTitolo").value = d.titolo || "";
      document.getElementById("vMetaAutore").value = d.autore || "";
      document.getElementById("vMetaAnno").value   = d.anno   || "";
      document.getElementById("vMetaNote").value   = d.note   || "";

      // Righe "dichiarato" nella tabella risultato: visibili solo se compilate
      const metaRows = [["rowTitolo","rTitolo",d.titolo], ["rowAutore","rAutore",d.autore], ["rowAnno","rAnno",d.anno], ["rowNote","rNote",d.note]];
      for (const [rowId, cellId, val] of metaRows) {
        document.getElementById(rowId).style.display = val ? "" : "none";
        document.getElementById(cellId).textContent = val || "";
      }

      document.getElementById("rHash").textContent        = d.sha256;
      document.getElementById("rFilename").textContent    = d.opera;
      document.getElementById("rSize").textContent        = fmt(d.dimensione_bytes);
      document.getElementById("rMime").textContent        = d.tipo_mime;
      document.getElementById("rTimestamp").textContent   = d.timestamp_leggibile;
      document.getElementById("rIssuer").textContent      = d.emesso_da;
      document.getElementById("rAttestation").textContent = d.attestazione;

      // P25: avviso onesto sulla fascia applicata — mai un blocco, solo
      // trasparenza su quale garanzia di custodia vale per questa attestazione
      // (vedi /condizioni/). Silenzioso nei casi ordinari (base/sviluppatore
      // senza convenzione): l'avviso serve solo dove cambia qualcosa.
      const fasciaNota = document.getElementById("fasciaNota");
      if (d.fascia === "convenzione" && d.convenzione) {
        fasciaNota.textContent = "Attestazione riconosciuta dalla convenzione con " + d.convenzione.name +
          ": il certificato è garantito recuperabile più a lungo (vedi le condizioni).";
        fasciaNota.style.display = "";
      } else if (d.fascia_motivo === "pool_esaurito") {
        fasciaNota.textContent = "Il monte mensile della tua convenzione è esaurito per questo mese: " +
          "l'attestazione è stata generata comunque, nella fascia gratuita di base (PDF recuperabile per almeno 6 mesi).";
        fasciaNota.style.display = "";
      } else if (d.fascia_motivo === "tetto_individuale") {
        fasciaNota.textContent = "Hai raggiunto il tuo limite personale mensile nella convenzione: " +
          "l'attestazione è stata generata comunque, nella fascia gratuita di base (PDF recuperabile per almeno 6 mesi).";
        fasciaNota.style.display = "";
      } else if (d.fascia === "professionale") {
        fasciaNota.textContent = "Attestazione riconosciuta nella fascia Professionale: " +
          "custodia del certificato garantita per almeno 5 anni.";
        fasciaNota.style.display = "";
      } else if (d.fascia_motivo === "quota_professionale_esaurita") {
        fasciaNota.textContent = "Hai raggiunto le 200 attestazioni mensili della fascia Professionale: " +
          "l'attestazione è stata generata comunque, nella fascia gratuita di base " +
          "(PDF recuperabile per almeno 6 mesi).";
        fasciaNota.style.display = "";
      } else {
        fasciaNota.style.display = "none";
      }

      // Il link alla prova blockchain e il badge valgono per il PDF precedente:
      // nascondili finché non viene generato il PDF di QUESTA attestazione.
      // ⚠️ Il badge si popola DOPO "Scarica il certificato PDF" (vedi downloadPdfBtn):
      // è quel passo a creare l'archivio (cert + prova .ots) da cui il badge legge.
      // Popolarlo qui, prima, darebbe un badge "non attestata" (e la cache lo terrebbe).
      document.getElementById("otsRow").style.display = "none";
      document.getElementById("permaRow").style.display = "none";
      document.getElementById("badgeDetails").style.display = "none";

      resultWrap.classList.add("show");
      resultWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {
      showErr("Impossibile completare l'attestazione (" + e.message + "). Se il file è molto grande la memoria del browser potrebbe non bastare; altrimenti controlla la connessione.");
    } finally {
      attestBtn.classList.remove("loading");
      attestBtn.disabled = false;
      btnLabel.textContent = "Genera attestazione SHA-256";
      // Il token Turnstile è monouso: resetta il widget per una nuova attestazione.
      if (turnstileEnabled() && window.turnstile) window.turnstile.reset();
    }
  });

  function showErr(msg) {
    errorMsg.textContent = "Errore: " + msg;
    errorMsg.classList.add("show");
  }

  // --- COPIA HASH ---
  function copyHash() {
    const h = document.getElementById("rHash").textContent;
    if (!h) return;
    navigator.clipboard.writeText(h).then(() => {
      const b = document.getElementById("copyBtn");
      b.textContent = "Copiato";
      b.classList.add("ok");
      setTimeout(() => {
        b.textContent = "Copia";
        b.classList.remove("ok");
      }, 2000);
    });
  }
  window.copyHash = copyHash; // per l'onclick inline

  // --- BADGE: popola anteprima + snippet HTML/Markdown per un dato hash ---
  // prefix = "badge" (scheda Attesta) o "vBadge" (esito Verifica): popola gli
  // elementi <prefix>Preview / <prefix>Html / <prefix>Md se presenti.
  function fillBadge(prefix, hash) {
    const verifyPageUrl = "https://attestazione.spaziogenesi.org?hash=" + hash;
    const badgeImgUrl   = WORKER_BASE + "/api/badge?hash=" + hash;
    const img    = document.getElementById(prefix + "Preview");
    const htmlEl = document.getElementById(prefix + "Html");
    const mdEl   = document.getElementById(prefix + "Md");
    if (img) img.src = badgeImgUrl;
    if (htmlEl) htmlEl.value =
      '<a href="' + verifyPageUrl + '" target="_blank" rel="noopener">\n' +
      '  <img src="' + badgeImgUrl + '" alt="Opera attestata — Spazio Genesi" height="28">\n' +
      '</a>';
    if (mdEl) mdEl.value =
      '[![Opera attestata — Spazio Genesi](' + badgeImgUrl + ')](' + verifyPageUrl + ')';
  }

  // --- COPIA SNIPPET BADGE ---
  function copyBadge(id, btn) {
    const ta = document.getElementById(id);
    if (!ta) return;
    navigator.clipboard.writeText(ta.value).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Copiato ✓";
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
  window.copyBadge = copyBadge; // per l'onclick inline

  function copyPerma(btn) {
    const a = document.getElementById("permaLink");
    if (!a || !a.href) return;
    navigator.clipboard.writeText(a.href).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Copiato ✓";
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  }
  window.copyPerma = copyPerma; // per l'onclick inline

  // --- DOWNLOAD TXT ---
  downloadBtn.addEventListener("click", () => {
    if (!lastData) return;
    const lines = [
      "SPAZIO GENESI ETS — CERTIFICATO DI ATTESTAZIONE OPERA",
      "=".repeat(54),
      "",
      "Opera:              " + lastData.opera,
      "Dimensione:         " + fmt(lastData.dimensione_bytes),
      "Tipo MIME:          " + lastData.tipo_mime,
      "SHA-256:            " + lastData.sha256,
      "Timestamp ISO:      " + lastData.timestamp_iso,
      "Timestamp leggibile:" + lastData.timestamp_leggibile,
    ];
    // Dati dichiarati (se presenti): coperti dalla firma HMAC, vanno
    // reinseriti identici per una futura verifica della firma.
    const declared = [
      ["Titolo (dichiarato):   ", lastData.titolo],
      ["Autore (dichiarato):   ", lastData.autore],
      ["Anno/versione:         ", lastData.anno],
      ["Note (dichiarate):     ", lastData.note],
    ].filter(([, v]) => v);
    if (declared.length) {
      lines.push("", "Dati dell'opera dichiarati dall'autore (vincolati alla firma HMAC):");
      for (const [label, v] of declared) lines.push(label + v);
    }
    lines.push(
      "",
      "Stringa di attestazione:",
      lastData.attestazione,
      "",
      "Firma HMAC (server): " + (lastData.hmac || "n/d"),
      "",
      "Emesso da: " + lastData.emesso_da,
    );
    const txt = lines.join("\n");

    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
    a.download = "attestazione-" + lastData.sha256.slice(0, 12) + ".txt";
    a.click();
  });

  // --- DOWNLOAD PDF DAL WORKER ---
  downloadPdfBtn.addEventListener("click", async () => {
    if (!lastData) return;
    // Nessuna challenge qui: l'attestazione (lastData) esiste solo dopo la verifica
    // anti-bot fatta a monte su "Genera attestazione"; il token HMAC lo dimostra.
    // Spinner + etichetta d'attesa: la prima richiesta dopo inattività può impiegare
    // alcuni secondi (cold start del worker/firma + ancoraggio OpenTimestamps).
    const pdfBtnLabel = document.getElementById("pdfBtnLabel");
    const labelOriginale = pdfBtnLabel.textContent;
    downloadPdfBtn.classList.add("loading");
    downloadPdfBtn.disabled = true;
    pdfBtnLabel.textContent = "Generazione del certificato in corso…";
    try {
      // Stesso voucher (se ancora attivo) allegato anche qui: serve solo a
      // taggare correttamente la fascia nel sidecar del certificato (§2.4/2.7),
      // non sblocca nulla che l'HMAC di lastData non garantisca già.
      const pdfHeaders = { "Content-Type": "application/json" };
      const activeVoucherForPdf = getActiveVoucher();
      if (activeVoucherForPdf) pdfHeaders["X-SG-Voucher"] = activeVoucherForPdf.token;
      const res = await fetch(WORKER_PDF_URL, {
        method: "POST",
        headers: pdfHeaders,
        body: JSON.stringify(lastData),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: res.status }));
        alert("Errore generazione PDF: " + (errBody.error || res.status));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Nome coerente col recupero (worker: certificato-<hash>.pdf) e con la
      // dicitura dell'interfaccia ("certificato PDF"): è lo stesso documento.
      a.download = "certificato-" + lastData.sha256.slice(0, 12) + ".pdf";
      a.click();
      URL.revokeObjectURL(url);

      // La prova OpenTimestamps nasce insieme al PDF: mostra il link al download
      const otsRow  = document.getElementById("otsRow");
      const otsLink = document.getElementById("otsLink");
      otsLink.href = WORKER_BASE + "/api/ots?hash=" + lastData.sha256;
      otsRow.style.display = "block";

      // Pagina di verifica permanente: ora che l'opera è in archivio, l'URL /c/<hash>
      // risponde. Lo stesso link è stampato nei "Dettagli tecnici" del certificato.
      const permaUrl  = CERT_PAGE_BASE + "/c/" + lastData.sha256;
      const permaLink = document.getElementById("permaLink");
      permaLink.href = permaUrl;
      permaLink.textContent = permaUrl;
      document.getElementById("permaRow").style.display = "block";

      // Ora l'opera è archiviata (cert + prova .ots): popola e mostra il badge.
      // È qui — non a "Genera attestazione" — che il badge risulta "attestata".
      fillBadge("badge", lastData.sha256);
      document.getElementById("badgeDetails").style.display = "";
    } catch (e) {
      alert("Errore di rete durante il download del PDF: " + e.message);
    } finally {
      downloadPdfBtn.classList.remove("loading");
      downloadPdfBtn.disabled = false;
      pdfBtnLabel.textContent = labelOriginale;
    }
  });

  // --- VERIFICA BLOCKCHAIN: scarica la prova .ots per l'hash inserito ---
  document.getElementById("otsVerifyLink").addEventListener("click", (ev) => {
    ev.preventDefault();
    const hash = (verifyHashInput.value || "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(hash)) {
      alert("Inserisci prima l'hash dichiarato (64 caratteri esadecimali) nel campo qui sopra.");
      return;
    }
    window.open(WORKER_BASE + "/api/ots?hash=" + hash, "_blank");
  });

  // --- VERIFICA HASH: CARICAMENTO FILE ---
  function loadVerifyFile(f) {
    verifyFile = f;
    verifyPreviewName.textContent = f.name;
    verifyPreviewMeta.textContent = (f.type || "tipo sconosciuto") + " · " + fmt(f.size);
    setThumb(verifyPreviewImg, f);
    verifyPreviewRow.classList.add("show");
    verifyErrorMsg.classList.remove("show");
    verifyResultWrap.classList.remove("show");
    updateVerifyBtnState();
  }

  function updateVerifyBtnState() {
    const hasFile = !!verifyFile;
    const hasHash = verifyHashInput.value.trim().length > 0;
    verifyBtn.disabled = !(hasFile && hasHash);
  }

  verifyFileInput.addEventListener("change", () => {
    if (verifyFileInput.files[0]) loadVerifyFile(verifyFileInput.files[0]);
  });

  verifyDropZone.addEventListener("dragover", e => {
    e.preventDefault();
    verifyDropZone.classList.add("over");
  });

  verifyDropZone.addEventListener("dragleave", () => {
    verifyDropZone.classList.remove("over");
  });

  verifyDropZone.addEventListener("drop", e => {
    e.preventDefault();
    verifyDropZone.classList.remove("over");
    const f = e.dataTransfer.files[0];
    if (f) {
      verifyFileInput.files = e.dataTransfer.files;
      loadVerifyFile(f);
    }
  });

  verifyHashInput.addEventListener("input", updateVerifyBtnState);

  // --- LETTURA AUTOMATICA DEL CERTIFICATO PDF (Feature 2) ---
  // Estrae dal PDF (con pdf.js, interamente lato client) impronta, stringa di
  // attestazione, firma HMAC e dati dichiarati: chi riceve un certificato ne
  // verifica l'AUTENTICITÀ (firma + data) oltre alla corrispondenza del file,
  // senza ricopiare nulla a mano dai "Dettagli tecnici".
  const certDropZone  = document.getElementById("certDropZone");
  const certFileInput = document.getElementById("certFileInput");
  const certReadBox   = document.getElementById("certReadBox");

  function pdfjsReady() {
    if (!window.pdfjsLib) return false;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf/pdf.worker.min.js";
    }
    return true;
  }

  // Ricostruisce il testo del PDF riga per riga (raggruppando i frammenti per
  // coordinata y), poi estrae i campi. I campi senza spazi (attestazione, HMAC)
  // si cercano sul testo "compatto" (whitespace rimosso): robusto rispetto a come
  // pdf.js spezza i frammenti. I dati dichiarati si leggono dal blocco delimitato.
  async function extractCertFields(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const lines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const byY = new Map();
      for (const it of tc.items) {
        if (!it.str) continue;
        const y = Math.round(it.transform[5]);
        if (!byY.has(y)) byY.set(y, []);
        byY.get(y).push({ x: it.transform[4], s: it.str });
      }
      for (const y of [...byY.keys()].sort((a, b) => b - a)) {
        const txt = byY.get(y).sort((a, b) => a.x - b.x).map(o => o.s).join("");
        if (txt.trim()) lines.push(txt);
      }
    }
    const tight = lines.join("\n").replace(/\s+/g, "");
    const out = { hash:"", attestazione:"", hmac:"", titolo:"", autore:"", anno:"", note:"" };

    const att = tight.match(/SHA-256:([0-9a-f]{64})@(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/i);
    if (att) { out.hash = att[1].toLowerCase(); out.attestazione = "SHA-256:" + out.hash + "@" + att[2]; }

    let hm = tight.match(/FirmaHMAC\(server\):([A-Za-z0-9+/]{43}=)/);
    if (!hm) hm = tight.match(/([A-Za-z0-9+/]{43}=)/); // fallback: unica stringa base64 con padding
    if (hm) out.hmac = hm[1];

    // Dati dichiarati: blocco compreso tra l'intestazione e l'avvertenza; gestisce
    // i valori andati a capo (li riaccoda al campo corrente).
    const start = lines.findIndex(l => /Dati dichiarati dall.?autore/i.test(l));
    const end   = lines.findIndex(l => /Dati forniti dall.?autore al momento/i.test(l));
    if (start >= 0 && end > start) {
      const acc = { titolo: [], autore: [], anno: [], note: [] };
      const labels = [["titolo",/^Titolo:\s*(.*)$/],["autore",/^Autore:\s*(.*)$/],
                      ["anno",/^Anno\/versione:\s*(.*)$/],["note",/^Note:\s*(.*)$/]];
      let cur = null;
      for (const raw of lines.slice(start + 1, end)) {
        const l = raw.trim(); if (!l) continue;
        let matched = false;
        for (const [k, re] of labels) {
          const m = l.match(re);
          if (m) { cur = k; acc[k].push(m[1]); matched = true; break; }
        }
        if (!matched && cur) acc[cur].push(l);
      }
      for (const k of ["titolo","autore","anno","note"]) {
        const v = acc[k].join(" ").replace(/\s+/g, " ").trim();
        if (v) out[k] = v;
      }
    }
    return out;
  }

  function applyCertFields(f) {
    verifyHashInput.value   = f.hash || "";
    verifyAttestInput.value = f.attestazione || "";
    verifyHmacInput.value   = f.hmac || "";
    document.getElementById("vMetaTitolo").value = f.titolo || "";
    document.getElementById("vMetaAutore").value = f.autore || "";
    document.getElementById("vMetaAnno").value   = f.anno   || "";
    document.getElementById("vMetaNote").value   = f.note   || "";
    updateVerifyBtnState();
    updateRecoverState();
  }

  async function loadCertPdf(f) {
    certReadBox.style.display = "block";
    certReadBox.style.color = "#666";
    certReadBox.textContent = "Lettura del certificato in corso…";
    if (!pdfjsReady()) {
      certReadBox.style.color = "#c0392b";
      certReadBox.textContent = "Lettore PDF non ancora pronto: attendi un istante e riprova.";
      return;
    }
    try {
      const f2 = await extractCertFields(f);
      if (!f2.hash) {
        certReadBox.style.color = "#c0392b";
        certReadBox.innerHTML = "Non riesco a leggere un'impronta valida da questo PDF. " +
          "Assicurati che sia un certificato emesso da questo servizio, oppure inserisci l'impronta manualmente qui sotto.";
        return;
      }
      applyCertFields(f2);
      const bits = ["impronta SHA-256"];
      if (f2.hmac) bits.push("firma di sicurezza");
      const meta = [f2.titolo && "titolo", f2.autore && "autore", f2.anno && "anno", f2.note && "note"].filter(Boolean);
      if (meta.length) bits.push("dati dichiarati (" + meta.join(", ") + ")");
      certReadBox.style.color = "#1e7e34";
      certReadBox.innerHTML = "✓ Letto dal certificato: " + bits.join(", ") +
        ".<br><span style='color:#777'>Ora scegli il file dell'opera (passo 1), poi premi «Verifica il certificato».</span>";
    } catch (e) {
      certReadBox.style.color = "#c0392b";
      certReadBox.textContent = "Impossibile leggere questo PDF. Inserisci l'impronta manualmente qui sotto.";
    }
  }

  certFileInput.addEventListener("change", () => { if (certFileInput.files[0]) loadCertPdf(certFileInput.files[0]); });
  certDropZone.addEventListener("dragover", e => { e.preventDefault(); certDropZone.classList.add("over"); });
  certDropZone.addEventListener("dragleave", () => certDropZone.classList.remove("over"));
  certDropZone.addEventListener("drop", e => {
    e.preventDefault(); certDropZone.classList.remove("over");
    const f = e.dataTransfer.files[0];
    if (f) { certFileInput.files = e.dataTransfer.files; loadCertPdf(f); }
  });

  // Riga d'esito (semaforo) per la card di verifica
  function verdictRow(state, text) {
    const fg = { ok:"#1e7e34", bad:"#c0392b", warn:"#8a6d00", info:"#555" };
    const bg = { ok:"#eef7ef", bad:"#fdecea", warn:"#fbf6e7", info:"#f4f4f2" };
    const ic = { ok:"✓", bad:"✕", warn:"!", info:"i" };
    const row = document.createElement("div");
    row.style.cssText = "display:flex; align-items:flex-start; gap:0.6rem; padding:0.6rem 0.8rem; " +
      "border-radius:6px; font-size:0.84rem; line-height:1.45; background:" + bg[state] + "; color:" + fg[state] + ";";
    const b = document.createElement("span");
    b.textContent = ic[state];
    b.style.cssText = "flex:0 0 auto; width:1.2rem; height:1.2rem; border-radius:50%; background:" + fg[state] +
      "; color:#fff; font-size:0.72rem; font-weight:700; display:inline-flex; align-items:center; justify-content:center; margin-top:0.05rem;";
    const s = document.createElement("span"); s.textContent = text;
    row.appendChild(b); row.appendChild(s);
    return row;
  }

  // --- MODALITÀ DELLA SCHEDA VERIFICA (consapevole dell'ingresso) ---
  // Da QR/link del certificato (?hash=): l'utente ha già un certificato e gli serve
  //   solo controllare che un file corrisponda → file dell'opera in primo piano,
  //   certificato PDF facoltativo (richiudibile) per verificare anche la firma.
  // A freddo (nessun ?hash): verifica completa → certificato PDF in primo piano
  //   (lo leggiamo noi) + file dell'opera da confrontare.
  function setupVerifyMode(mode, hash) {
    const ctx         = document.getElementById("verifyContext");
    const workBlock   = document.getElementById("workBlock");
    const certBlock   = document.getElementById("certBlock");
    const certSummary = document.getElementById("certSummary");
    const workHeading = document.getElementById("workHeading");
    if (!ctx || !workBlock || !certBlock) return;
    if (mode === "qr") {
      workBlock.style.order = "1";
      certBlock.style.order = "2";
      certBlock.open = false;
      workHeading.textContent = "Scegli il file dell'opera da controllare";
      certSummary.textContent = "Verifica anche la firma del certificato (facoltativo)";
      ctx.style.display = "block";
      ctx.innerHTML =
        "Stai verificando il certificato con impronta " +
        "<code style=\"font-size:0.78rem; word-break:break-all;\">" + hash + "</code>.<br>" +
        "Scegli qui sotto il file dell'opera per controllare che corrisponda. " +
        "Vuoi la verifica completa, anche di firma e data? Aggiungi il certificato PDF.";
    } else {
      certBlock.style.order = "1";
      workBlock.style.order = "2";
      certBlock.open = true;
      workHeading.textContent = "Scegli il file dell'opera da confrontare";
      certSummary.textContent = "Apri il certificato PDF — lo legge il tuo browser";
      ctx.style.display = "none";
    }
  }

  // --- PRE-COMPILAZIONE DA URL (?hash=...) ---
  // Quando si apre la pagina via QR code o link del certificato, il parametro hash
  // è già nell'URL: lo usiamo per pre-compilare il campo di verifica e impostare la
  // modalità "da QR". La funzione è INVOCATA in fondo allo script, così tutte le
  // definizioni che usa esistono già (evita il ReferenceError che rompeva il QR).
  function prefillFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const hashParam = params.get("hash");
    if (hashParam && /^[0-9a-f]{64}$/i.test(hashParam)) {
      const h = hashParam.toLowerCase();
      verifyHashInput.value = h;
      updateVerifyBtnState();
      updateRecoverState();
      setupVerifyMode("qr", h);
      // Chi arriva dal QR/link del certificato vuole verificare: apri quella scheda
      mostraTab("verifica");
      document.getElementById("verifyDropZone")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setupVerifyMode("cold");
    }
  }

  // --- VERIFICA DEL CERTIFICATO: file + dati (auto-letti dal PDF o manuali) ---
  verifyBtn.addEventListener("click", async () => {
    if (!verifyFile || !verifyHashInput.value.trim()) return;

    verifyBtn.disabled = true;
    verifyBtnLabel.textContent = "Verifica in corso…";
    verifyErrorMsg.classList.remove("show");
    verifyResultWrap.classList.remove("show");
    const rows = document.getElementById("verdictRows");
    rows.innerHTML = "";

    try {
      // Full privacy (1.14.0): l'impronta dell'opera si calcola QUI, nel browser,
      // e il confronto con quella dichiarata avviene in locale — il file non
      // viene inviato al server. Al worker si chiede solo ciò che il browser
      // non può fare da solo: verificare la firma HMAC (il segreto è suo).
      verifyBtnLabel.textContent = "Calcolo dell'impronta…";
      const claimed  = verifyHashInput.value.trim().toLowerCase();
      const digest   = await sha256Hex(verifyFile);
      const coincide = digest === claimed;

      let hasMeta = false;
      let hmacValido = null;
      if (verifyAttestInput.value.trim() && verifyHmacInput.value.trim()) {
        verifyBtnLabel.textContent = "Verifica della firma…";
        const fd = new FormData();
        fd.append("hash", claimed);
        fd.append("attestazione", verifyAttestInput.value.trim());
        fd.append("hmac", verifyHmacInput.value.trim());
        // Dati dichiarati: se il certificato li riportava, la firma HMAC li copre
        // e devono essere forniti identici perché la verifica riesca.
        for (const [field, id] of [["titolo","vMetaTitolo"], ["autore","vMetaAutore"], ["anno","vMetaAnno"], ["note","vMetaNote"]]) {
          const v = document.getElementById(id).value.trim();
          if (v) { fd.append(field, v); hasMeta = true; }
        }

        const res = await fetch(WORKER_VERIFY_URL, { method: "POST", body: fd });
        const d = await res.json();
        if (!res.ok) {
          verifyErrorMsg.textContent = "Errore: " + (d.error || ("HTTP " + res.status));
          verifyErrorMsg.classList.add("show");
          return;
        }
        hmacValido = d.hmac_valido;
      }
      verifyHashCalc.textContent = digest;

      // Badge incorporabile: mostrato SOLO se la corrispondenza è confermata
      // (impronta verificata). Usa l'hash effettivo del file appena verificato.
      const vBadge = document.getElementById("vBadgeDetails");
      if (coincide) {
        fillBadge("vBadge", digest);
        vBadge.style.display = "";
      } else {
        vBadge.style.display = "none";
      }

      // 1) Corrispondenza opera ↔ certificato (confronto fatto in locale)
      rows.appendChild(verdictRow(coincide ? "ok" : "bad",
        coincide ? "L'opera corrisponde al certificato."
                 : "L'opera NON corrisponde a questo certificato."));

      // 2) Autenticità (firma HMAC del server) + integrità dei dati dichiarati
      if (hmacValido === true) {
        rows.appendChild(verdictRow("ok", "Certificato autentico, emesso da Spazio Genesi."));
        if (hasMeta) rows.appendChild(verdictRow("ok", "Dati dichiarati integri: non alterati dopo l'emissione."));
      } else if (hmacValido === false) {
        rows.appendChild(verdictRow("bad", "Firma di sicurezza NON valida: certificato non riconosciuto o dati alterati."));
        if (hasMeta) rows.appendChild(verdictRow("info", "Se hai aperto il PDF, controlla i dati letti nei «Dettagli tecnici» (passo 2): un errore di lettura può invalidare la firma."));
      } else {
        rows.appendChild(verdictRow("info", "Firma non verificata: manca la firma di sicurezza. Apri il certificato PDF (passo 2) per il controllo completo."));
      }

      // 3) Ancoraggio blockchain (OpenTimestamps): presenza della prova .ots
      const otsPlaceholder = verdictRow("info", "Controllo dell'ancoraggio blockchain…");
      rows.appendChild(otsPlaceholder);
      try {
        const otsRes = await fetch(WORKER_BASE + "/api/ots?hash=" + verifyHashInput.value.trim().toLowerCase());
        if (otsRes.ok) {
          otsPlaceholder.replaceWith(verdictRow("ok", "Esistenza ancorata nella blockchain di Bitcoin (OpenTimestamps)."));
        } else {
          otsPlaceholder.replaceWith(verdictRow("info", "Nessun ancoraggio blockchain per questa impronta (certificati anteriori alla v1.7)."));
        }
      } catch {
        otsPlaceholder.replaceWith(verdictRow("info", "Ancoraggio blockchain non verificabile in questo momento."));
      }

      verifyResultWrap.classList.add("show");
      verifyResultWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) {
      verifyErrorMsg.textContent = "Errore durante la verifica: riprova (file troppo grande per la memoria del browser, o problema di rete).";
      verifyErrorMsg.classList.add("show");
    } finally {
      verifyBtn.disabled = false;
      verifyBtnLabel.textContent = "Verifica il certificato";
    }
  });

  // --- RECUPERO CERTIFICATO SMARRITO (GET /api/cert?hash=) ---
  // L'hash si ottiene dal campo impronta (se valido) oppure calcolando in
  // locale l'SHA-256 del file caricato: il file NON viene inviato al server.
  const recoverBtn      = document.getElementById("recoverBtn");
  const recoverBtnLabel = document.getElementById("recoverBtnLabel");
  const recoverMsg      = document.getElementById("recoverMsg");
  const HEX64_RE = /^[0-9a-f]{64}$/;

  function updateRecoverState() {
    const hashOk = HEX64_RE.test(verifyHashInput.value.trim().toLowerCase());
    // Il recupero legge dall'archivio: se è giù (da /api/status) lo inibiamo.
    recoverBtn.disabled = !(verifyFile || hashOk) || window.__svcArchiveDown === true;
  }
  verifyHashInput.addEventListener("input", updateRecoverState);

  // loadVerifyFile è già definita sopra: la avvolgiamo per aggiornare anche
  // lo stato del pulsante di recupero quando si carica un file.
  const _loadVerifyFile = loadVerifyFile;
  loadVerifyFile = function (f) { _loadVerifyFile(f); updateRecoverState(); };

  function showRecoverMsg(text, ok) {
    recoverMsg.textContent = text;
    recoverMsg.style.color = ok ? "#2e7d32" : "#c0392b";
    recoverMsg.style.display = "block";
  }

  async function sha256Hex(file) {
    const buf = await file.arrayBuffer();
    const h = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  recoverBtn.addEventListener("click", async () => {
    recoverMsg.style.display = "none";
    recoverBtn.disabled = true;
    recoverBtnLabel.textContent = "Ricerca in archivio…";
    try {
      let hash = verifyHashInput.value.trim().toLowerCase();
      if (!HEX64_RE.test(hash)) {
        if (!verifyFile) return;
        recoverBtnLabel.textContent = "Calcolo dell'impronta…";
        hash = await sha256Hex(verifyFile);
      }
      const res = await fetch(WORKER_BASE + "/api/cert?hash=" + hash);
      if (res.status === 404) {
        showRecoverMsg("Nessun certificato in archivio per questa opera. " +
          "Nota: il recupero vale per i certificati emessi dal 13 giugno 2026 in poi; " +
          "per quelli precedenti scrivici indicando l'impronta.", false);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showRecoverMsg("Errore: " + (err.error || ("HTTP " + res.status)), false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificato-" + hash.slice(0, 12) + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      showRecoverMsg("Certificato recuperato: è la copia firmata conservata nel nostro archivio " +
        "(in caso di più emissioni per la stessa opera, la prima — quella con la data più antica).", true);
    } catch (e) {
      showRecoverMsg("Errore di rete durante il recupero. Riprova tra qualche istante.", false);
    } finally {
      recoverBtn.disabled = false;
      recoverBtnLabel.textContent = "Recupera il certificato dall'archivio";
      updateRecoverState();
    }
  });

  // Pre-compilazione da ?hash= (QR/link del certificato): invocata QUI, in fondo,
  // quando tutte le funzioni e costanti referenziate sono già definite.
  prefillFromUrl();

  // --- STATO SEMAFORICO DEI SERVIZI (/api/status) ---
  // Mostra lo stato live nel footer e nel pannello "Stato dei servizi" (Istruzioni),
  // e pilota la UX inibendo le azioni le cui componenti sono indisponibili.
  // Principio prudente: si inibisce SOLO su un "down" certo; se lo stato non è
  // raggiungibile, neutro (grigio) e nessun blocco.
  const WORKER_STATUS_URL = WORKER_BASE + "/api/status";
  const SVC_LABELS = { ok: "operativo", down: "non disponibile", degraded: "rallentato", "n/d": "non rilevato", na: "non rilevato" };

  let svcPdfNote = null;
  function ensurePdfNote() {
    if (svcPdfNote) return svcPdfNote;
    const btn = document.getElementById("downloadPdfBtn");
    if (!btn || !btn.parentNode) return null;
    svcPdfNote = document.createElement("p");
    svcPdfNote.className = "microcopy";
    svcPdfNote.style.cssText = "display:none; color:#c0392b;";
    btn.parentNode.insertBefore(svcPdfNote, btn);
    return svcPdfNote;
  }

  function applyServiceGating(st) {
    const signerDown  = !!st && st.signer === "down";
    const archiveDown = !!st && st.archive === "down";
    window.__svcArchiveDown = archiveDown;
    if (typeof updateRecoverState === "function") updateRecoverState();

    const btn = document.getElementById("downloadPdfBtn");
    if (!btn) return;
    const note = ensurePdfNote();
    if ((signerDown || archiveDown) && !btn.classList.contains("loading")) {
      btn.disabled = true;
      if (note) {
        note.textContent = archiveDown
          ? "Archivio temporaneamente non disponibile: puoi comunque generare l'attestazione e scaricare il .txt; riprova più tardi per il certificato PDF."
          : "Firma del certificato temporaneamente non disponibile: puoi scaricare il .txt; riprova più tardi per il PDF.";
        note.style.display = "block";
      }
    } else {
      if (!btn.classList.contains("loading")) btn.disabled = false;
      if (note) note.style.display = "none";
    }
  }

  function renderServiceStatus(st) {
    const keys = ["worker", "signer", "archive", "anchor"];
    let down = 0, degraded = 0, na = 0;
    for (const k of keys) {
      const dot = document.querySelector('.svc-dot[data-svc="' + k + '"]');
      const lab = document.querySelector('[data-svc-state="' + k + '"]');
      const v = st ? (st[k] || "n/d") : "na";
      const cls = v === "ok" ? "ok" : v === "down" ? "down" : v === "degraded" ? "degraded" : "na";
      if (dot) dot.className = "svc-dot " + cls;
      if (lab) lab.textContent = SVC_LABELS[v] || "non rilevato";
      if (cls === "down") down++; else if (cls === "degraded") degraded++; else if (cls === "na") na++;
    }
    const checked = document.getElementById("svcChecked");
    if (checked) checked.textContent = st
      ? "Ultimo controllo: " + new Date().toLocaleTimeString("it-IT")
      : "Ultimo controllo: stato non raggiungibile";

    const fdot = document.querySelector("#svcFooter .svc-dot");
    const ftxt = document.getElementById("svcFooterText");
    let fcls = "ok", ftext = "Servizi operativi";
    if (!st || na === keys.length) { fcls = "na"; ftext = "Stato dei servizi non disponibile"; }
    else if (down > 0) { fcls = "down"; ftext = "Disservizio parziale in corso"; }
    else if (degraded > 0) { fcls = "degraded"; ftext = "Servizi operativi (un componente rallentato)"; }
    if (fdot) fdot.className = "svc-dot " + fcls;
    if (ftxt) ftxt.textContent = ftext;
  }

  async function pollServiceStatus() {
    let st = null;
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(WORKER_STATUS_URL, { signal: ctrl.signal });
      clearTimeout(to);
      if (r.ok) st = await r.json();
    } catch { /* lasciamo st = null → neutro, nessun blocco */ }
    renderServiceStatus(st);
    applyServiceGating(st);
  }

  pollServiceStatus();
  setInterval(pollServiceStatus, 180000); // 180s: traffico basso, nessun bisogno di poll frequenti
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pollServiceStatus(); });
