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

## Licenza

Copyright (c) 2026 Spazio Genesi ETS — licenza **MIT** (vedi [LICENSE](LICENSE)).
