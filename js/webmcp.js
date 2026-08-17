// P50 F2 — WebMCP: espone alla pagina tre strumenti in SOLA LETTURA per gli
// agenti AI che girano nel browser (navigator.modelContext).
//
// ⚠️ NESSUNO STRUMENTO CHE ATTESTA, per scelta. La challenge anti-bot davanti a
// /api/hash esiste perché l'attestazione sia un gesto umano: un'attestazione
// emessa da una macchina senza nessuno che la guardi non proverebbe la stessa
// cosa (stesso non-obiettivo di P49). Chi vuole attestare da un agente usa il
// device flow, una chiave API o la CLI — vedi /auth.md.
//
// Vincoli rispettati:
// - file esterno, mai JS inline (CSP: script-src 'self' https:);
// - IIFE, zero simboli globali: js/app.js, ui-extensions.js e bindings.js
//   condividono lo scope globale e un `const` in cima collide (bug reale
//   "Identifier 'btn' has already been declared");
// - se l'API non c'è, il file non fa NULLA e non stampa nulla in console:
//   il comportamento della pagina resta bit-identico;
// - descrizioni in inglese: il consumatore è un agente, e questo file è
//   condiviso fra la home italiana e quella inglese.
(function () {
  "use strict";

  var mc = typeof navigator !== "undefined" ? navigator.modelContext : null;
  if (!mc) return; // nessun agente in ascolto: silenzio totale.

  var API = "https://imgauth.spaziogenesi.org";
  var HEX64 = /^[0-9a-fA-F]{64}$/;
  var TIMEOUT_MS = 12000;

  // Gli strumenti restituiscono STRINGHE, non oggetti: WebMCP è una bozza e le
  // implementazioni divergono sulla forma del valore di ritorno — una stringa è
  // l'unica cosa che ogni client sa consumare senza ambiguità.
  function fail(msg) {
    return "ERROR: " + msg;
  }

  function fetchWithTimeout(url, opts) {
    opts = opts || {};
    if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
      opts.signal = AbortSignal.timeout(TIMEOUT_MS);
    }
    return fetch(url, opts);
  }

  var tools = [
    {
      name: "spaziogenesi_service_status",
      description:
        "Report the live status of the Spazio Genesi attestation service: engine, " +
        "certificate archive, PDF signer and Bitcoin anchor. Use this before " +
        "telling a user that attesting or verifying is unavailable.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: function () {
        return fetchWithTimeout(API + "/api/status")
          .then(function (r) {
            if (!r.ok) return fail("status endpoint returned HTTP " + r.status);
            return r.json();
          })
          .then(function (d) {
            if (typeof d === "string") return d;
            return (
              "Service status (ok | degraded | down | n/d):\n" +
              "- engine: " + d.worker + "\n" +
              "- certificate archive: " + d.archive + "\n" +
              "- PDF signer: " + d.signer + "\n" +
              "- Bitcoin anchor: " + d.anchor + "\n" +
              "- sampled at: " + d.checked_at + "\n" +
              "Note: a degraded anchor does not block attestation; a down signer " +
              "only prevents the signed PDF certificate."
            );
          })
          .catch(function (e) {
            return fail("could not reach the status endpoint (" + (e && e.name) + ")");
          });
      }
    },

    {
      name: "spaziogenesi_verify_attestation",
      description:
        "Check whether an attestation certificate issued by Spazio Genesi is " +
        "authentic and unaltered, by validating its HMAC signature. This does NOT " +
        "check that a file matches the fingerprint — recompute the SHA-256 locally " +
        "for that. Requires the three values printed on the certificate.",
      inputSchema: {
        type: "object",
        properties: {
          fingerprint: {
            type: "string",
            description: "The SHA-256 fingerprint, 64 hexadecimal characters."
          },
          attestation: {
            type: "string",
            description: 'The attestation string, in the form "SHA-256:<fingerprint>@<iso timestamp>".'
          },
          signature: {
            type: "string",
            description: "The HMAC signature from the certificate (base64, not hexadecimal)."
          },
          declaredTitle: { type: "string", description: "Declared title, if the certificate shows one." },
          declaredAuthor: { type: "string", description: "Declared author, if the certificate shows one." },
          declaredYear: { type: "string", description: "Declared year, if the certificate shows one." },
          declaredNotes: { type: "string", description: "Declared notes, if the certificate shows any." }
        },
        required: ["fingerprint", "attestation", "signature"],
        additionalProperties: false
      },
      execute: function (input) {
        input = input || {};
        // Validazione locale prima di qualunque chiamata di rete.
        if (!HEX64.test(String(input.fingerprint || "").trim())) {
          return Promise.resolve(
            fail("fingerprint must be exactly 64 hexadecimal characters.")
          );
        }
        if (!input.attestation || !input.signature) {
          return Promise.resolve(fail("attestation and signature are both required."));
        }

        var fd = new FormData();
        fd.append("hash", String(input.fingerprint).trim().toLowerCase());
        fd.append("attestazione", String(input.attestation));
        fd.append("hmac", String(input.signature));
        // I metadati dichiarati sono VINCOLATI alla firma: se il certificato li
        // riporta e non vengono ripassati identici, la firma risulta invalida su
        // un certificato perfettamente valido. È il falso allarme che è saltato
        // fuori nel restore drill di luglio — per questo sono nello schema.
        if (input.declaredTitle) fd.append("titolo", String(input.declaredTitle));
        if (input.declaredAuthor) fd.append("autore", String(input.declaredAuthor));
        if (input.declaredYear) fd.append("anno", String(input.declaredYear));
        if (input.declaredNotes) fd.append("note", String(input.declaredNotes));

        return fetchWithTimeout(API + "/api/verify", { method: "POST", body: fd })
          .then(function (r) {
            if (!r.ok) return fail("verify endpoint returned HTTP " + r.status);
            return r.json();
          })
          .then(function (d) {
            if (typeof d === "string") return d;
            if (d.hmac_valido === true) {
              return (
                "SIGNATURE VALID. Spazio Genesi issued this attestation, and neither " +
                "the fingerprint, the timestamp nor the declared data have been " +
                "altered since.\nStill to check separately: recompute the file's " +
                "SHA-256 locally and compare it with " + d.hash_dichiarato + "."
              );
            }
            return (
              "SIGNATURE NOT VALID for the values supplied.\nBefore reporting " +
              "tampering, check the most common cause: if the certificate shows a " +
              "declared title, author, year or notes, they are bound into the " +
              "signature and must be passed back byte-identical. Re-read them from " +
              "the certificate and try again."
            );
          })
          .catch(function (e) {
            return fail("could not reach the verification endpoint (" + (e && e.name) + ")");
          });
      }
    },

    {
      name: "spaziogenesi_lookup_certificate",
      description:
        "Check whether a SHA-256 fingerprint has an archived certificate with a " +
        "permanent public verification page, and return its URL. A negative answer " +
        "does not mean nothing was ever attested: an attestation created without " +
        "requesting the PDF certificate archives nothing.",
      inputSchema: {
        type: "object",
        properties: {
          fingerprint: {
            type: "string",
            description: "The SHA-256 fingerprint, 64 hexadecimal characters."
          }
        },
        required: ["fingerprint"],
        additionalProperties: false
      },
      execute: function (input) {
        var h = String((input && input.fingerprint) || "").trim().toLowerCase();
        if (!HEX64.test(h)) {
          return Promise.resolve(
            fail("fingerprint must be exactly 64 hexadecimal characters.")
          );
        }
        var url = "https://attestazione.spaziogenesi.org/c/" + h;
        // GET, mai HEAD: il Worker non risponde a HEAD (lezione del collettore
        // di evidenze GTF). Same-origin, quindi nessuna questione di CORS.
        return fetchWithTimeout(url)
          .then(function (r) {
            if (r.status === 200) {
              return (
                "ARCHIVED. A certificate exists for this fingerprint.\n" +
                "Public verification page: " + url + "\n" +
                "Signed PDF: " + API + "/api/cert?hash=" + h + "\n" +
                "Bitcoin anchor proof: " + API + "/api/ots?hash=" + h
              );
            }
            if (r.status === 404) {
              return (
                "NOT IN THE ARCHIVE. No certificate was found for this fingerprint.\n" +
                "This can mean the work was never attested, or that an attestation " +
                "was created without ever requesting the PDF certificate — in which " +
                "case nothing was archived. Both are indistinguishable from outside."
              );
            }
            return fail("lookup returned HTTP " + r.status);
          })
          .catch(function (e) {
            return fail("could not complete the lookup (" + (e && e.name) + ")");
          });
      }
    }
  ];

  // La bozza WebMCP è cambiata durante la sua stesura: alcune implementazioni
  // espongono registerTool(tool, signal), altre provideContext({tools}).
  // Proviamo la prima e ricadiamo sulla seconda, senza mai lasciar propagare
  // un errore: se nessuna delle due funziona, la pagina resta esattamente
  // com'era.
  try {
    if (typeof mc.registerTool === "function") {
      for (var i = 0; i < tools.length; i++) mc.registerTool(tools[i]);
    } else if (typeof mc.provideContext === "function") {
      mc.provideContext({ tools: tools });
    }
  } catch (e) {
    /* nessun rumore in console: un agente assente o un'API diversa non è un errore. */
  }
})();
