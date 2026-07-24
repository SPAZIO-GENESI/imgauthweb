// js/i18n.js — dizionario delle stringhe UI. Caricato PRIMA di app.js.
// ⚠️ IIFE obbligatoria: app.js/ui-extensions.js/bindings.js sono script classici
// che condividono lo scope globale; un const a livello superiore collide
// (stessa classe del bug "Identifier 'btn' has already been declared", P24).
(function () {
  const DICT = {
    it: {
      "footer.interfaccia":        "interfaccia v{v}",
      "footer.motore":             " · motore v{v}",

      "voucher.attivo":            "Stai attestando come {email}",
      "voucher.attivoFascia":      "Stai attestando come {email} — fascia: {fascia}",

      "file.tipoSconosciuto":      "tipo sconosciuto",
      "file.iconFallback":         "FILE",

      "err.fileTroppoGrande":      "File troppo grande (max 1 GB). L'impronta si calcola nel tuo browser e serve memoria sufficiente a leggere il file.",
      "err.turnstileMancante":     "Completa la verifica anti-bot qui sopra, poi riprova.",
      "err.voucherScaduto":        "Il tuo accesso con email istituzionale è scaduto. Accedi di nuovo qui sopra, poi riprova.",
      "err.httpStatus":            "Errore {status}",
      "err.attestazioneFallita":   "Impossibile completare l'attestazione ({msg}). Se il file è molto grande la memoria del browser potrebbe non bastare; altrimenti controlla la connessione.",
      "err.generazionePdfFallita": "Errore generazione PDF: {msg}",
      "err.retePdf":               "Errore di rete durante il download del PDF: {msg}",
      "err.hashMancante":          "Inserisci prima l'hash dichiarato (64 caratteri esadecimali) nel campo qui sopra.",

      "errore.generico":           "Errore: {msg}",

      "btn.elaborazione":          "Elaborazione…",
      "btn.calcolo":               "Calcolo dell'impronta…",
      "btn.attestazione":          "Attestazione…",
      "btn.genera":                "Genera attestazione SHA-256",
      "btn.copia":                 "Copia",
      "btn.copiato":               "Copiato",
      "btn.copiatoCheck":          "Copiato ✓",
      "btn.generazionePdf":        "Generazione del certificato in corso…",
      "btn.verificaIlCertificato": "Verifica il certificato",
      "btn.recupera":              "Recupera il certificato dall'archivio",

      "fascia.convenzione":                 "Attestazione riconosciuta dalla convenzione con {nome}: il certificato è garantito recuperabile più a lungo (vedi le condizioni).",
      "fascia.poolEsaurito":                "Il monte mensile della tua convenzione è esaurito per questo mese: l'attestazione è stata generata comunque, nella fascia gratuita di base (PDF recuperabile per almeno 6 mesi).",
      "fascia.tettoIndividuale":            "Hai raggiunto il tuo limite personale mensile nella convenzione: l'attestazione è stata generata comunque, nella fascia gratuita di base (PDF recuperabile per almeno 6 mesi).",
      "fascia.professionale":               "Attestazione riconosciuta nella fascia Professionale: custodia del certificato garantita per almeno 5 anni.",
      "fascia.quotaProfessionaleEsaurita":  "Hai raggiunto le 200 attestazioni mensili della fascia Professionale: l'attestazione è stata generata comunque, nella fascia gratuita di base (PDF recuperabile per almeno 6 mesi).",

      "txt.intestazione":            "SPAZIO GENESI ETS — CERTIFICATO DI ATTESTAZIONE OPERA",
      "txt.labelOpera":              "Opera:              ",
      "txt.labelDimensione":         "Dimensione:         ",
      "txt.labelTipoMime":           "Tipo MIME:          ",
      "txt.labelSha256":             "SHA-256:            ",
      "txt.labelTimestampIso":       "Timestamp ISO:      ",
      "txt.labelTimestampLeggibile": "Timestamp leggibile:",
      "txt.labelTitolo":             "Titolo (dichiarato):   ",
      "txt.labelAutore":             "Autore (dichiarato):   ",
      "txt.labelAnno":               "Anno/versione:         ",
      "txt.labelNote":               "Note (dichiarate):     ",
      "txt.datiDichiaratiTitolo":    "Dati dell'opera dichiarati dall'autore (vincolati alla firma HMAC):",
      "txt.stringaAttestazione":     "Stringa di attestazione:",
      "txt.firmaHmac":               "Firma HMAC (server): ",
      "txt.nd":                      "n/d",
      "txt.emessoDa":                "Emesso da: ",

      "cert.lettura":                    "Lettura del certificato in corso…",
      "cert.pdfjsNonPronto":             "Lettore PDF non ancora pronto: attendi un istante e riprova.",
      "cert.impossibileLeggereImpronta": "Non riesco a leggere un'impronta valida da questo PDF. Assicurati che sia un certificato emesso da questo servizio, oppure inserisci l'impronta manualmente qui sotto.",
      "cert.bitImpronta":                "impronta SHA-256",
      "cert.bitFirma":                   "firma di sicurezza",
      "cert.campoTitolo":                "titolo",
      "cert.campoAutore":                "autore",
      "cert.campoAnno":                  "anno",
      "cert.campoNote":                  "note",
      "cert.bitDatiDichiarati":          "dati dichiarati ({campi})",
      "cert.lettoOk":                    "✓ Letto dal certificato: {bits}.<br><span style='color:#777'>Ora scegli il file dell'opera (passo 1), poi premi «Verifica il certificato».</span>",
      "cert.letturaFallita":             "Impossibile leggere questo PDF. Inserisci l'impronta manualmente qui sotto.",

      "verify.headingQr":            "Scegli il file dell'opera da controllare",
      "verify.certSummaryQr":        "Verifica anche la firma del certificato (facoltativo)",
      "verify.ctxQr":                "Stai verificando il certificato con impronta <code style=\"font-size:0.78rem; word-break:break-all;\">{hash}</code>.<br>Scegli qui sotto il file dell'opera per controllare che corrisponda. Vuoi la verifica completa, anche di firma e data? Aggiungi il certificato PDF.",
      "verify.headingCold":          "Scegli il file dell'opera da confrontare",
      "verify.certSummaryCold":      "Apri il certificato PDF — lo legge il tuo browser",
      "verify.inCorso":              "Verifica in corso…",
      "verify.verificaFirma":        "Verifica della firma…",
      "verify.corrisponde":          "L'opera corrisponde al certificato.",
      "verify.nonCorrisponde":       "L'opera NON corrisponde a questo certificato.",
      "verify.certificatoAutentico": "Certificato autentico, emesso da Spazio Genesi.",
      "verify.datiIntegri":          "Dati dichiarati integri: non alterati dopo l'emissione.",
      "verify.firmaNonValida":       "Firma di sicurezza NON valida: certificato non riconosciuto o dati alterati.",
      "verify.suggerimentoLettura":  "Se hai aperto il PDF, controlla i dati letti nei «Dettagli tecnici» (passo 2): un errore di lettura può invalidare la firma.",
      "verify.firmaNonVerificata":   "Firma non verificata: manca la firma di sicurezza. Apri il certificato PDF (passo 2) per il controllo completo.",
      "verify.controlloAncoraggio":  "Controllo dell'ancoraggio blockchain…",
      "verify.ancoraggioOk":         "Esistenza ancorata nella blockchain di Bitcoin (OpenTimestamps).",
      "verify.ancoraggioAssente":    "Nessun ancoraggio blockchain per questa impronta (certificati anteriori alla v1.7).",
      "verify.ancoraggioNonVerificabile": "Ancoraggio blockchain non verificabile in questo momento.",
      "verify.erroreGenerico":       "Errore durante la verifica: riprova (file troppo grande per la memoria del browser, o problema di rete).",

      "recupero.ricerca":     "Ricerca in archivio…",
      "recupero.nonTrovato":  "Nessun certificato in archivio per questa opera. Nota: il recupero vale per i certificati emessi dal 13 giugno 2026 in poi; per quelli precedenti scrivici indicando l'impronta.",
      "recupero.trovato":     "Certificato recuperato: è la copia firmata conservata nel nostro archivio (in caso di più emissioni per la stessa opera, la prima — quella con la data più antica).",
      "recupero.erroreRete":  "Errore di rete durante il recupero. Riprova tra qualche istante.",

      "svc.ok":                      "operativo",
      "svc.down":                    "non disponibile",
      "svc.degraded":                "rallentato",
      "svc.nonRilevato":             "non rilevato",
      "svc.notaArchivioGiu":         "Archivio temporaneamente non disponibile: puoi comunque generare l'attestazione e scaricare il .txt; riprova più tardi per il certificato PDF.",
      "svc.notaFirmaGiu":            "Firma del certificato temporaneamente non disponibile: puoi scaricare il .txt; riprova più tardi per il PDF.",
      "svc.ultimoControllo":         "Ultimo controllo: {ora}",
      "svc.ultimoControlloIrraggiungibile": "Ultimo controllo: stato non raggiungibile",
      "svc.operativi":               "Servizi operativi",
      "svc.nonDisponibile":          "Stato dei servizi non disponibile",
      "svc.disservizioParziale":     "Disservizio parziale in corso",
      "svc.operativoRallentato":     "Servizi operativi (un componente rallentato)"
    },
    // Popolato in F2 (contenuto inglese delle 6 pagine). Finché resta vuoto,
    // t() ricade sull'italiano con un avviso in console — atteso durante F1.
    en: {}
  };

  const LANG = (document.documentElement.lang || "it").toLowerCase().startsWith("en") ? "en" : "it";

  // Fallback esplicito: se manca una chiave in EN si usa l'italiano e si logga su
  // console (mai una stringa vuota o la chiave grezza in faccia all'utente).
  function t(key, params) {
    let s = (DICT[LANG] && DICT[LANG][key]);
    if (s === undefined) {
      s = DICT.it[key];
      if (s === undefined) { console.warn("[i18n] chiave assente:", key); return ""; }
      if (LANG !== "it") console.warn("[i18n] manca la traduzione", LANG, "per:", key);
    }
    if (params) for (const k of Object.keys(params)) s = s.split("{" + k + "}").join(params[k]);
    return s;
  }

  window.SG_I18N = { lang: LANG, t };
})();
