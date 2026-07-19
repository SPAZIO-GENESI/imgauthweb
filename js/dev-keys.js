// P29 FASE 3: legge l'esito del login OAuth dal fragment dell'URL — mai un
// server nel mezzo, la chiave viaggia SOLO qui, lato client, e sparisce
// dalla barra degli indirizzi non appena letta (history.replaceState).
// File esterno, non inline: CSP di authweb (script-src senza 'unsafe-inline').
(function () {
  "use strict";

  var ERROR_MESSAGES = {
    scaduta: "Questa richiesta di accesso è scaduta o non è più valida. Riprova qui sotto.",
    provider: "Questo provider non è al momento disponibile. Riprova con un altro.",
    email: "Il tuo account non espone un indirizzo email leggibile. Prova con un altro provider.",
    "non-verificata": "Il tuo account non ha un'email verificata. Usa un altro account o un altro provider.",
    interno: "Si è verificato un errore interno. Riprova.",
    annullata: "L'accesso non è stato completato. Riprova quando vuoi.",
    richiesta: "Richiesta non valida. Riprova dal basso.",
  };

  function parseFragment(hash) {
    var params = {};
    var raw = hash.replace(/^#/, "");
    if (!raw) return params;
    raw.split("&").forEach(function (pair) {
      var idx = pair.indexOf("=");
      if (idx < 0) return;
      var k = decodeURIComponent(pair.slice(0, idx));
      var v = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " "));
      params[k] = v;
    });
    return params;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showResult(node, hideIntro) {
    var result = document.getElementById("result");
    if (!result) return;
    result.innerHTML = "";
    result.appendChild(node);
    result.classList.add("show");
    if (hideIntro) {
      var intro = document.getElementById("introBlock");
      if (intro) intro.style.display = "none";
    }
  }

  function renderSuccess(key, quota, conv) {
    var card = el("div", "result-card");
    card.appendChild(el("h2", null, "Chiave creata ✓"));
    card.appendChild(el("p", null, "Copiala ora: per motivi di sicurezza non potremo più mostrartela."));
    var fp = el("div", "fingerprint", escHtml(key));
    card.appendChild(fp);
    var row = el("div", "copy-row");
    var btn = el("button", "btn primary", "Copia la chiave");
    btn.type = "button";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(key).then(function () {
        btn.textContent = "Copiata ✓";
        setTimeout(function () { btn.textContent = "Copia la chiave"; }, 2000);
      });
    });
    row.appendChild(btn);
    card.appendChild(row);
    var quotaNote = quota ? "Quota: " + escHtml(quota) + " attestazioni al mese, come header " : "";
    card.appendChild(el("p", "warn-once",
      quotaNote + '<span class="fingerprint" style="display:inline;padding:0;border:none;background:none;margin:0;">Authorization: Bearer ' + escHtml(key) + "</span> su POST /api/hash."));
    if (conv) {
      card.appendChild(el("p", "warn-once", "Chiave emessa nell'ambito di una convenzione attiva (id: " + escHtml(conv) + "). I certificati emessi con questa chiave godono della garanzia di persistenza prevista dalla convenzione."));
    }
    card.appendChild(el("p", "warn-once", "Se la perdi: scrivi a it@spaziogenesi.org per la revoca, poi torna qui per riemetterne una nuova."));
    var actions = el("div", "link-row");
    var docsLink = document.createElement("a");
    docsLink.className = "btn primary";
    docsLink.href = "/docs/";
    docsLink.textContent = "Documentazione API";
    actions.appendChild(docsLink);
    var mcpLink = document.createElement("a");
    mcpLink.className = "btn";
    mcpLink.href = "https://github.com/SPAZIO-GENESI/attest-mcp";
    mcpLink.textContent = "Server MCP";
    actions.appendChild(mcpLink);
    card.appendChild(actions);
    showResult(card, true);
  }

  function renderAlreadyActive(id) {
    var card = el("div", "result-card info");
    card.appendChild(el("h2", null, "Hai già una chiave attiva"));
    card.appendChild(el("p", null, "Il tuo indirizzo email ha già una chiave self-service attiva (id " + '<span class="fingerprint" style="display:inline;padding:0;border:none;background:none;margin:0;">' + escHtml(id) + "</span>)."));
    card.appendChild(el("p", null, 'Puoi continuare a usare quella chiave. Se l\'hai persa, o vuoi revocarla per riceverne una nuova, scrivi a <a href="mailto:it@spaziogenesi.org">it@spaziogenesi.org</a>.'));
    showResult(card, true);
  }

  function renderError(code) {
    var card = el("div", "result-card error");
    card.appendChild(el("h2", null, "Non ci siamo riusciti"));
    card.appendChild(el("p", null, escHtml(ERROR_MESSAGES[code] || "Si è verificato un errore. Riprova.")));
    showResult(card, false);
  }

  var params = parseFragment(window.location.hash);
  if (params.sgk) {
    renderSuccess(params.sgk, params.q, params.conv || null);
  } else if (params.sgstate === "gia-attiva") {
    renderAlreadyActive(params.id || "");
  } else if (params.sgerr) {
    renderError(params.sgerr);
  }

  // La chiave (o l'errore) non deve restare nella barra degli indirizzi:
  // una volta letta, si pulisce l'URL. Niente di tutto questo raggiunge
  // mai un server (fragment) né un log.
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
})();
