# authweb — Attestazione opere digitali (interfaccia)

[![Genesis Trust Score](https://trust.spaziogenesi.org/badge.svg)](https://trust.spaziogenesi.org)

Interfaccia web del servizio di attestazione crittografica di Spazio Genesi ETS:
https://attestazione.spaziogenesi.org

Single file (`index.html`), HTML/CSS/JS puro, zero dipendenze, pubblicata su
GitHub Pages. Il motore di attestazione (HMAC, certificato PDF, ancoraggio
OpenTimestamps) è il worker [imgauth](https://github.com/SPAZIO-GENESI/imgauth),
rilasciato sotto AGPL-3.0.

**Full privacy** (dalla 1.14.0): l'impronta SHA-256 dell'opera è calcolata nel
browser con WebCrypto — il file non lascia mai il dispositivo dell'utente, né
per l'attestazione né per la verifica; al motore viaggia solo l'impronta.

**Installabile come PWA** (dalla 1.15.0): `manifest.json` + icone (`/icons/`,
`apple-touch-icon.png`) rendono la pagina installabile sulla home screen di
Android e iOS. Nessun service worker: la pagina resta servita live da GitHub
Pages (niente cache offline da invalidare).

## Sicurezza

Segnalazioni di vulnerabilità → [`/sicurezza/`](https://attestazione.spaziogenesi.org/sicurezza/)
(policy di responsible disclosure, safe harbor per la ricerca in buona fede);
`security.txt` conforme RFC 9116 su
[`/.well-known/security.txt`](https://attestazione.spaziogenesi.org/.well-known/security.txt).

## Licenza

Copyright (c) 2026 Spazio Genesi ETS — licenza **MIT** (vedi [LICENSE](LICENSE)).
