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
    en: {
      "footer.interfaccia":        "interface v{v}",
      "footer.motore":             " · engine v{v}",

      "voucher.attivo":            "Attesting as {email}",
      "voucher.attivoFascia":      "Attesting as {email} — tier: {fascia}",

      "file.tipoSconosciuto":      "unknown type",
      "file.iconFallback":         "FILE",

      "err.fileTroppoGrande":      "File too large (max 1 GB). The fingerprint is computed in your browser and needs enough memory to read the whole file.",
      "err.turnstileMancante":     "Complete the anti-bot check above, then try again.",
      "err.voucherScaduto":        "Your institutional email sign-in has expired. Sign in again above, then try again.",
      "err.httpStatus":            "Error {status}",
      "err.attestazioneFallita":   "Couldn't complete the attestation ({msg}). If the file is very large your browser may not have enough memory; otherwise check your connection.",
      "err.generazionePdfFallita": "Error generating the PDF: {msg}",
      "err.retePdf":               "Network error while downloading the PDF: {msg}",
      "err.hashMancante":          "Enter the declared fingerprint (64 hex characters) in the field above first.",

      "errore.generico":           "Error: {msg}",

      "btn.elaborazione":          "Working…",
      "btn.calcolo":               "Computing the fingerprint…",
      "btn.attestazione":          "Attesting…",
      "btn.genera":                "Generate SHA-256 attestation",
      "btn.copia":                 "Copy",
      "btn.copiato":               "Copied",
      "btn.copiatoCheck":          "Copied ✓",
      "btn.generazionePdf":        "Generating the certificate…",
      "btn.verificaIlCertificato": "Verify the certificate",
      "btn.recupera":              "Retrieve the certificate from the archive",

      "fascia.convenzione":                 "Attestation recognized under the agreement with {nome}: the certificate is guaranteed to stay retrievable for longer (see the terms).",
      "fascia.poolEsaurito":                "Your agreement's monthly pool is used up for this month: the attestation was generated anyway, in the free Base tier (PDF retrievable for at least 6 months).",
      "fascia.tettoIndividuale":            "You've reached your personal monthly limit under the agreement: the attestation was generated anyway, in the free Base tier (PDF retrievable for at least 6 months).",
      "fascia.professionale":               "Attestation recognized under the Professional tier: certificate custody guaranteed for at least 5 years.",
      "fascia.quotaProfessionaleEsaurita":  "You've reached the 200 monthly attestations of the Professional tier: the attestation was generated anyway, in the free Base tier (PDF retrievable for at least 6 months).",

      "txt.intestazione":            "SPAZIO GENESI ETS — WORK ATTESTATION CERTIFICATE",
      "txt.labelOpera":              "Work:               ",
      "txt.labelDimensione":         "Size:               ",
      "txt.labelTipoMime":           "MIME type:          ",
      "txt.labelSha256":             "SHA-256:            ",
      "txt.labelTimestampIso":       "ISO timestamp:      ",
      "txt.labelTimestampLeggibile": "Readable timestamp: ",
      "txt.labelTitolo":             "Title (declared):      ",
      "txt.labelAutore":             "Author (declared):     ",
      "txt.labelAnno":               "Year/version:          ",
      "txt.labelNote":               "Notes (declared):      ",
      "txt.datiDichiaratiTitolo":    "Author-declared data about the work (bound to the HMAC signature):",
      "txt.stringaAttestazione":     "Attestation string:",
      "txt.firmaHmac":               "HMAC signature (server): ",
      "txt.nd":                      "n/a",
      "txt.emessoDa":                "Issued by: ",

      "cert.lettura":                    "Reading the certificate…",
      "cert.pdfjsNonPronto":             "PDF reader not ready yet: wait a moment and try again.",
      "cert.impossibileLeggereImpronta": "I can't read a valid fingerprint from this PDF. Make sure it's a certificate issued by this service, or enter the fingerprint manually below.",
      "cert.bitImpronta":                "SHA-256 fingerprint",
      "cert.bitFirma":                   "security signature",
      "cert.campoTitolo":                "title",
      "cert.campoAutore":                "author",
      "cert.campoAnno":                  "year",
      "cert.campoNote":                  "notes",
      "cert.bitDatiDichiarati":          "declared data ({campi})",
      "cert.lettoOk":                    "✓ Read from the certificate: {bits}.<br><span style='color:#777'>Now choose the file of the work (step 1), then press «Verify the certificate».</span>",
      "cert.letturaFallita":             "Couldn't read this PDF. Enter the fingerprint manually below.",

      "verify.headingQr":            "Choose the file of the work to check",
      "verify.certSummaryQr":        "Also verify the certificate's signature (optional)",
      "verify.ctxQr":                "You're verifying the certificate with fingerprint <code style=\"font-size:0.78rem; word-break:break-all;\">{hash}</code>.<br>Choose the file of the work below to check that it matches. Want the full verification, including signature and date? Add the certificate PDF.",
      "verify.headingCold":          "Choose the file of the work to compare",
      "verify.certSummaryCold":      "Open the certificate PDF — your browser reads it",
      "verify.inCorso":              "Verifying…",
      "verify.verificaFirma":        "Verifying the signature…",
      "verify.corrisponde":          "The work matches the certificate.",
      "verify.nonCorrisponde":       "The work does NOT match this certificate.",
      "verify.certificatoAutentico": "Authentic certificate, issued by Spazio Genesi.",
      "verify.datiIntegri":          "Declared data intact: unchanged since issuance.",
      "verify.firmaNonValida":       "Security signature NOT valid: certificate not recognized or data altered.",
      "verify.suggerimentoLettura":  "If you opened the PDF, check the data read in «Technical details» (step 2): a reading error can invalidate the signature.",
      "verify.firmaNonVerificata":   "Signature not verified: the security signature is missing. Open the certificate PDF (step 2) for the full check.",
      "verify.controlloAncoraggio":  "Checking the blockchain anchor…",
      "verify.ancoraggioOk":         "Existence anchored in the Bitcoin blockchain (OpenTimestamps).",
      "verify.ancoraggioAssente":    "No blockchain anchor for this fingerprint (certificates issued before v1.7).",
      "verify.ancoraggioNonVerificabile": "Blockchain anchor not verifiable right now.",
      "verify.erroreGenerico":       "Error during verification: try again (the file may be too large for your browser's memory, or there may be a network problem).",

      "recupero.ricerca":     "Searching the archive…",
      "recupero.nonTrovato":  "No certificate in the archive for this work. Note: retrieval covers certificates issued from 13 June 2026 onward; for earlier ones, write to us with the fingerprint.",
      "recupero.trovato":     "Certificate retrieved: this is the signed copy kept in our archive (if the same work was attested more than once, the first one — the oldest).",
      "recupero.erroreRete":  "Network error during retrieval. Try again in a moment.",

      "svc.ok":                      "operational",
      "svc.down":                    "unavailable",
      "svc.degraded":                "slowed down",
      "svc.nonRilevato":             "not detected",
      "svc.notaArchivioGiu":         "Archive temporarily unavailable: you can still generate the attestation and download the .txt; try again later for the PDF certificate.",
      "svc.notaFirmaGiu":            "Certificate signing temporarily unavailable: you can download the .txt; try again later for the PDF.",
      "svc.ultimoControllo":         "Last checked: {ora}",
      "svc.ultimoControlloIrraggiungibile": "Last checked: status unreachable",
      "svc.operativi":               "Services operational",
      "svc.nonDisponibile":          "Service status unavailable",
      "svc.disservizioParziale":     "Partial service disruption",
      "svc.operativoRallentato":     "Services operational (one component slowed down)"
    }
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
