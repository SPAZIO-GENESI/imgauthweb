// Listener dei bottoni che prima usavano attributi onclick inline.
// Esternalizzati il 2026-07-15: la CSP impostata all'edge (script-src senza
// 'unsafe-inline') blocca anche gli attributi evento inline, non solo i
// blocchi <script>. Le funzioni chiamate (mostraTab, copyHash, copyBadge,
// copyPerma) sono le globali di app.js; mostraTab viene incapsulata da
// ui-extensions.js, ma qui la risolviamo al momento del click, quindi
// otteniamo sempre la versione finale.
(function () {
  function on(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }
  on("tabBtnAttesta", function () { mostraTab("attesta"); });
  on("tabBtnVerifica", function () { mostraTab("verifica"); });
  on("tabBtnIstruzioni", function () { mostraTab("istruzioni"); });
  on("copyBtn", function () { copyHash(); });
  on("copyPermaBtn", function () { copyPerma(this); });
  on("ctaAttestaBtn", function () {
    mostraTab("attesta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-badge]"), function (btn) {
    btn.addEventListener("click", function () { copyBadge(btn.dataset.copyBadge, btn); });
  });
})();
