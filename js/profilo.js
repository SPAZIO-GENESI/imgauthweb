(function () {
  // P29 FASE 4: il guscio vive su authweb, le API restano su imgauth —
  // ogni fetch passa da qui ed è quindi cross-origin (CORS già pronto sul
  // Worker: X-SG-Voucher in Access-Control-Allow-Headers, preflight gestito).
  var API_BASE = "https://imgauth.spaziogenesi.org";

  // P48: stringhe dinamiche (stato, log, messaggi) da js/i18n.js — la
  // cornice HTML della pagina resta comunque tradotta a parte (en/profilo/).
  var t = window.SG_I18N.t;
  var DATE_LOCALE = window.SG_I18N.lang === "en" ? "en-US" : "it-IT";

  var voucherKey = "sg_pro_voucher";

  function getVoucher() { return sessionStorage.getItem(voucherKey) || ""; }
  function setVoucher(v) { sessionStorage.setItem(voucherKey, v); }
  function clearVoucher() { sessionStorage.removeItem(voucherKey); }

  // Cattura il voucher dal fragment (#sgv=...), lo sposta in sessionStorage e
  // ripulisce l'URL — stesso principio del sito (P25 §2.7): mai un cookie,
  // mai inviato a un server se non come header esplicito su questa richiesta.
  (function captureVoucherFromHash() {
    var m = location.hash.match(/sgv=([^&]+)/);
    if (m) {
      setVoucher(decodeURIComponent(m[1]));
      history.replaceState(null, "", location.pathname + location.search);
    }
  })();

  function api(path, opts) {
    opts = opts || {};
    var v = getVoucher();
    if (v) opts.headers = Object.assign({ "X-SG-Voucher": v }, opts.headers || {});
    return fetch(API_BASE + path, opts).then(function (res) {
      if (res.status === 403) {
        return res.json().then(function (b) {
          if (b.error === "voucher_scaduto") { clearVoucher(); showState("anon"); }
          throw new Error(b.error || "unauthorized");
        });
      }
      return res.json().then(function (body) {
        if (!res.ok) throw new Error(body.error || ("HTTP " + res.status));
        return body;
      });
    });
  }

  var states = ["Anon", "Onboard", "Developer", "Convention", "Active", "Canceled"];
  function showState(name) {
    states.forEach(function (s) {
      document.getElementById("state" + s).style.display = s.toLowerCase() === name ? "" : "none";
    });
  }

  function fmtDate(ms) {
    if (!ms) return "—";
    try { return new Date(ms).toLocaleDateString(DATE_LOCALE, { year: "numeric", month: "long", day: "numeric" }); } catch (e) { return String(ms); }
  }
  function fmtDateTime(ms) {
    if (!ms) return "—";
    try { return new Date(ms).toLocaleString(DATE_LOCALE, { dateStyle: "short", timeStyle: "short" }); } catch (e) { return String(ms); }
  }
  function fmtEur(cents) {
    if (cents == null) return "—";
    return (cents / 100).toLocaleString(DATE_LOCALE, { style: "currency", currency: "EUR" });
  }
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var EVENT_LABELS = { created: t("profilo.event.created"), renewed: t("profilo.event.renewed"), payment_failed: t("profilo.event.paymentFailed"), canceled: t("profilo.event.canceled"), cancel_scheduled: t("profilo.event.cancelScheduled") };
  var CHANNEL_LABELS = { web: t("profilo.channel.web"), api: t("profilo.channel.api"), mcp: t("profilo.channel.mcp"), telegram: t("profilo.channel.telegram") };

  var certsPage = 1;

  function renderIdentity(data) {
    document.getElementById("identityEmail").textContent = data.email || "—";
    document.getElementById("identityFascia").textContent = (data.contract && data.contract.label) || "—";
    document.getElementById("identityRetention").textContent = (data.contract && data.contract.retention) || "—";
    document.getElementById("identityBar").style.display = "";
  }

  function renderMe(data) {
    renderIdentity(data);
    document.getElementById("integrationCard").style.display = "none";
    if (!data.subscription) {
      var pricing = data.pricing;
      var priceText = pricing
        ? t("profilo.price.abbonamentoAnnuale", { price: fmtEur(pricing.amount_cents) })
        : t("profilo.price.nessunListino");
      if (data.contract && data.contract.fascia === "convenzione") {
        showState("convention");
        loadIntegration();
        return;
      }
      if (data.contract && data.contract.fascia === "sviluppatore") {
        document.getElementById("devOnboardPrice").textContent = priceText;
        if (data.dev_profile) {
          document.getElementById("devAppName").value = data.dev_profile.app_name || "";
          document.getElementById("devOs").value = data.dev_profile.os || "";
          document.getElementById("devEnvironment").value = data.dev_profile.environment || "";
          document.getElementById("devProfileConsent").checked = true;
        }
        showState("developer");
        loadIntegration();
        return;
      }
      document.getElementById("onboardPrice").textContent = priceText;
      showState("onboard");
      return;
    }
    var sub = data.subscription;
    if (sub.status === "canceled") {
      document.getElementById("canceledDate").textContent = fmtDate(sub.canceled_at);
      showState("canceled");
      return;
    }
    document.getElementById("pastDueBanner").style.display = sub.status === "past_due" ? "" : "none";
    document.getElementById("cancelScheduledBanner").style.display = sub.cancel_at_period_end ? "" : "none";
    document.getElementById("subStatus").textContent = sub.status === "past_due" ? t("profilo.sub.inTolleranza") : t("profilo.sub.attivo");
    document.getElementById("subPeriodEnd").textContent = fmtDate(sub.period_end);
    document.getElementById("subPrice").textContent = fmtEur(sub.price_cents) + t("profilo.price.perAnno");

    var used = data.usage.used, quota = data.usage.quota;
    document.getElementById("usageText").textContent = t("profilo.usage.text", { used: used, quota: quota, month: data.usage.month });
    document.getElementById("usageBar").style.width = Math.min(100, Math.round((used / quota) * 100)) + "%";

    var evBody = document.getElementById("eventsBody");
    evBody.innerHTML = data.events.map(function (e) {
      var detail = "";
      if (e.detail && e.detail.period_end) detail = t("profilo.events.nuovaScadenza", { date: fmtDate(e.detail.period_end) });
      else if (e.detail && e.detail.amount_cents) detail = fmtEur(e.detail.amount_cents);
      return "<tr><td>" + fmtDateTime(e.ts) + "</td><td>" + escHtml(EVENT_LABELS[e.type] || e.type) + "</td><td>" + escHtml(detail) + "</td></tr>";
    }).join("") || "<tr><td colspan=\"3\">" + escHtml(t("profilo.events.nessunEvento")) + "</td></tr>";

    document.getElementById("segmentSelect").value = (data.profile && data.profile.segment) || "";
    document.getElementById("regionSelect").value = (data.profile && data.profile.region) || "";
    document.getElementById("profileConsent").checked = !!data.profile;

    showState("active");
    loadCertificates(1);
    loadIntegration();
  }

  // ── P28: candidatura vetrina Integrazioni ─────────────────────────────
  var INTEGRATION_STATUS_LABELS = {
    pending: t("profilo.integration.status.pending"),
    approved: t("profilo.integration.status.approved"),
    rejected: t("profilo.integration.status.rejected"),
    removed: t("profilo.integration.status.removed"),
  };

  function renderIntegration(data) {
    var card = document.getElementById("integrationCard");
    if (!data.eligible) { card.style.display = "none"; return; }
    card.style.display = "";
    var banner = document.getElementById("integrationStatusBanner");
    var withdrawBtn = document.getElementById("intWithdrawBtn");
    var logoSection = document.getElementById("intLogoSection");
    var integ = data.integration;
    document.getElementById("intAppName").value = integ ? (integ.app_name || "") : "";
    document.getElementById("intUrl").value = integ ? (integ.url || "") : "";
    document.getElementById("intDescription").value = integ ? (integ.description || "") : "";
    var badgeSection = document.getElementById("intBadgeSection");
    if (integ) {
      banner.textContent = INTEGRATION_STATUS_LABELS[integ.status] || integ.status;
      banner.className = "banner " + (integ.status === "approved" ? "off" : "warn");
      banner.style.display = "";
      withdrawBtn.style.display = integ.status === "removed" ? "none" : "";
      logoSection.style.display = integ.status === "removed" ? "none" : "";
      if (integ.status === "approved") {
        var badgeUrl = API_BASE + "/api/badge/integration?id=" + integ.id;
        var pageUrl = "https://attestazione.spaziogenesi.org/integrazioni/";
        var badgeAlt = t("profilo.integration.badgeAlt");
        document.getElementById("intBadgeHtml").value =
          '<a href="' + pageUrl + '"><img src="' + badgeUrl + '" alt="' + badgeAlt + '"></a>';
        document.getElementById("intBadgeMd").value =
          '[![' + badgeAlt + '](' + badgeUrl + ')](' + pageUrl + ')';
        badgeSection.style.display = "";
      } else {
        badgeSection.style.display = "none";
      }
    } else {
      banner.style.display = "none";
      withdrawBtn.style.display = "none";
      logoSection.style.display = "none";
      badgeSection.style.display = "none";
    }
  }

  function copyFromTextarea(id) {
    var ta = document.getElementById(id);
    ta.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).catch(function () {});
    else document.execCommand("copy");
  }
  document.getElementById("intBadgeHtmlCopy").addEventListener("click", function () { copyFromTextarea("intBadgeHtml"); });
  document.getElementById("intBadgeMdCopy").addEventListener("click", function () { copyFromTextarea("intBadgeMd"); });

  function loadIntegration() {
    api("/api/pro/integration").then(renderIntegration).catch(function () {});
  }

  document.getElementById("intSaveBtn").addEventListener("click", function () {
    var msg = document.getElementById("intMsg");
    var payload = {
      app_name: document.getElementById("intAppName").value.trim(),
      url: document.getElementById("intUrl").value.trim(),
      description: document.getElementById("intDescription").value.trim(),
    };
    if (!payload.app_name || !payload.url || !payload.description) {
      msg.textContent = t("profilo.integration.compilaCampi"); msg.className = "msg err"; return;
    }
    msg.textContent = t("profilo.integration.invio"); msg.className = "msg";
    api("/api/pro/integration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function () { msg.textContent = t("profilo.integration.inviata"); msg.className = "msg ok"; loadIntegration(); })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("intWithdrawBtn").addEventListener("click", function () {
    if (!confirm(t("profilo.integration.confermaRitiro"))) return;
    var msg = document.getElementById("intMsg");
    api("/api/pro/integration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdraw: true }) })
      .then(function () { msg.textContent = t("profilo.integration.ritirata"); msg.className = "msg ok"; loadIntegration(); })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("intLogoBtn").addEventListener("click", function () {
    var msg = document.getElementById("intLogoMsg");
    var input = document.getElementById("intLogoInput");
    var file = input.files && input.files[0];
    if (!file) { msg.textContent = t("profilo.integration.scegliFile"); msg.className = "msg err"; return; }
    var fd = new FormData();
    fd.append("logo", file);
    msg.textContent = t("profilo.integration.caricamento"); msg.className = "msg";
    api("/api/pro/integration/logo", { method: "POST", body: fd })
      .then(function () { msg.textContent = t("profilo.integration.logoCaricato"); msg.className = "msg ok"; input.value = ""; loadIntegration(); })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  function loadCertificates(page) {
    certsPage = page;
    api("/api/pro/certificates?page=" + page).then(function (data) {
      var body = document.getElementById("certsBody");
      body.innerHTML = data.certificates.map(function (c) {
        var short = c.sha256.slice(0, 12) + "…";
        return "<tr><td>" + fmtDateTime(c.ts) + "</td><td class=\"fingerprint\">" + escHtml(short) + "</td><td>" +
          escHtml(CHANNEL_LABELS[c.channel] || c.channel || "—") +
          "</td><td><a href=\"https://attestazione.spaziogenesi.org/c/" + c.sha256 + "\" target=\"_blank\" rel=\"noopener\">" + escHtml(t("profilo.certs.verifica")) + "</a></td></tr>";
      }).join("") || "<tr><td colspan=\"4\">" + escHtml(t("profilo.certs.nessunCertificato")) + "</td></tr>";
      document.getElementById("certsPageInfo").textContent = t("profilo.certs.pagina", { page: data.page, total: Math.max(1, Math.ceil(data.total / data.per_page)) });
      document.getElementById("certsPrevBtn").disabled = data.page <= 1;
      document.getElementById("certsNextBtn").disabled = data.page * data.per_page >= data.total;
    }).catch(function () {});
  }

  function loadMe() {
    api("/api/pro/me").then(renderMe).catch(function () { /* voucher_scaduto già gestito in api() */ });
  }

  if (getVoucher()) loadMe(); else showState("anon");

  function doCheckout(discountInputId, msgId) {
    var msg = document.getElementById(msgId);
    msg.textContent = t("profilo.common.attendere"); msg.className = "msg";
    var code = document.getElementById(discountInputId).value.trim();
    api("/api/pro/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(code ? { discount_code: code } : {}) })
      .then(function (data) { location.href = data.url; })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  }
  document.getElementById("checkoutBtn").addEventListener("click", function () { doCheckout("discountInput", "checkoutMsg"); });
  document.getElementById("devCheckoutBtn").addEventListener("click", function () { doCheckout("devDiscountInput", "devCheckoutMsg"); });

  document.getElementById("portalBtn").addEventListener("click", function () {
    var msg = document.getElementById("portalMsg");
    msg.textContent = t("profilo.common.attendere"); msg.className = "msg";
    api("/api/pro/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(function (data) { location.href = data.url; })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("reactivateBtn").addEventListener("click", function () {
    api("/api/pro/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(function (data) { location.href = data.url; })
      .catch(function (e) { alert(e.message); });
  });

  document.getElementById("certsPrevBtn").addEventListener("click", function () { if (certsPage > 1) loadCertificates(certsPage - 1); });
  document.getElementById("certsNextBtn").addEventListener("click", function () { loadCertificates(certsPage + 1); });

  function doLogout() { clearVoucher(); document.getElementById("identityBar").style.display = "none"; document.getElementById("integrationCard").style.display = "none"; showState("anon"); }
  document.getElementById("logoutBtnOnboard").addEventListener("click", doLogout);
  document.getElementById("logoutBtnDeveloper").addEventListener("click", doLogout);
  document.getElementById("logoutBtnConvention").addEventListener("click", doLogout);
  document.getElementById("logoutBtnActive").addEventListener("click", doLogout);
  document.getElementById("logoutBtnCanceled").addEventListener("click", doLogout);

  document.getElementById("saveDevProfileBtn").addEventListener("click", function () {
    var msg = document.getElementById("devProfileMsg");
    var appName = document.getElementById("devAppName").value.trim();
    var os = document.getElementById("devOs").value;
    var environment = document.getElementById("devEnvironment").value.trim();
    var consent = document.getElementById("devProfileConsent").checked;
    if ((appName || os || environment) && !consent) { msg.textContent = t("profilo.common.serveConsenso"); msg.className = "msg err"; return; }
    msg.textContent = t("profilo.common.salvataggio"); msg.className = "msg";
    api("/api/pro/dev-profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_name: appName || null, os: os || null, environment: environment || null, consent: consent }),
    })
      .then(function () { msg.textContent = t("profilo.common.salvato"); msg.className = "msg ok"; })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("clearDevProfileBtn").addEventListener("click", function () {
    if (!confirm(t("profilo.dev.confermaRimuovi"))) return;
    var msg = document.getElementById("devProfileMsg");
    api("/api/pro/dev-profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clear: true }) })
      .then(function () {
        document.getElementById("devAppName").value = "";
        document.getElementById("devOs").value = "";
        document.getElementById("devEnvironment").value = "";
        document.getElementById("devProfileConsent").checked = false;
        msg.textContent = t("profilo.common.rimosso"); msg.className = "msg ok";
      })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("saveProfileBtn").addEventListener("click", function () {
    var msg = document.getElementById("profileMsg");
    var segment = document.getElementById("segmentSelect").value;
    var region = document.getElementById("regionSelect").value;
    var consent = document.getElementById("profileConsent").checked;
    if ((segment || region) && !consent) { msg.textContent = t("profilo.common.serveConsenso"); msg.className = "msg err"; return; }
    msg.textContent = t("profilo.common.salvataggio"); msg.className = "msg";
    api("/api/pro/profile", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segment: segment || null, region: region || null, consent: consent }),
    })
      .then(function () { msg.textContent = t("profilo.common.salvato"); msg.className = "msg ok"; })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });

  document.getElementById("clearProfileBtn").addEventListener("click", function () {
    if (!confirm(t("profilo.profile.confermaRimuovi"))) return;
    var msg = document.getElementById("profileMsg");
    api("/api/pro/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clear: true }) })
      .then(function () {
        document.getElementById("segmentSelect").value = "";
        document.getElementById("regionSelect").value = "";
        document.getElementById("profileConsent").checked = false;
        msg.textContent = t("profilo.common.rimosso"); msg.className = "msg ok";
      })
      .catch(function (e) { msg.textContent = e.message; msg.className = "msg err"; });
  });
})();
