> Questa è la resa testuale di una pagina interattiva: i comandi (scelta del
> file, campi, pulsanti) qui non esistono. Per usare il servizio da un
> programma, le risorse scritte per le macchine sono più adatte:
>
> - istruzioni operative: <https://attestazione.spaziogenesi.org/.well-known/agent-skills/index.json>
> - credenziali: <https://attestazione.spaziogenesi.org/auth.md>
> - contratto API: <https://imgauth.spaziogenesi.org/openapi.json>
> - mappa del sito: <https://attestazione.spaziogenesi.org/llms.txt>

Gratuito · open source · senza registrazione

# Attestazione delle *opere digitali*

Dimostra che la tua opera esisteva oggi, esattamente così com'è:
scegli il file, ottieni un certificato da conservare. Gratis, in un minuto —
e il file non lascia mai il tuo dispositivo.

Il file resta da te
Qualsiasi formato, fino a 1 GB
Verifica gratuita per sempre

Il servizio fornisce attestazione crittografica di impronta digitale
(hash) di file informatici. Non costituisce registrazione di diritto d'autore né
certificazione legale della titolarità dell'opera.

Attesti con continuità? C'è la [fascia Professionale](https://attestazione.spaziogenesi.org/professionale/):
200 attestazioni al mese e custodia 5 anni — in promozione a 20 € l'anno fino a fine 2026.

Puoi installare questa pagina come app: dal menu del browser scegli
"Aggiungi alla schermata Home" (o "Installa app").

**Cos'è un'impronta? Guardala dal vivo**

L'impronta, dal vivo

Questa è un'impronta SHA-256, calcolata nel tuo
browser. Cambia una sola lettera qui sopra e cambierà tutta: per questo dimostra
che un file è rimasto esattamente com'era.

## Scegli la tua opera

qualsiasi file, fino a 1 GB

Trascina il file qui, o clicca per selezionare

Qualsiasi formato — l'impronta si calcola nel tuo browser, il file non viene inviato

## Racconta l'opera

facoltativo

**Aggiungi titolo, autore, anno e note — compariranno sul certificato**

Questi dati compaiono sul certificato come dichiarazioni dell'autore e vengono
vincolati alla firma di sicurezza: non saranno modificabili dopo l'emissione.

Titolo dell'opera

Autore o pseudonimo

Anno o versione

Note

## Genera l'attestazione

**Hai una convenzione o un abbonamento Professionale? Accedi con la tua email**

Se la tua accademia, il tuo ente o la tua azienda ha una convenzione con Spazio Genesi —
o se hai un abbonamento Professionale — verifica la tua email: le attestazioni verranno
riconosciute automaticamente nella tua fascia, con maggiore garanzia di custodia del
certificato. Nessuna password, nessun account: un solo accesso one-shot, valido per
questa sessione del browser.

[Continua con Google](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=google&purpose=attest)
[Continua con Microsoft](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=microsoft&purpose=attest)
[Continua con LinkedIn](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=linkedin&purpose=attest)

Esci

Genera attestazione SHA-256

✓ La tua opera è attestata

Impronta digitale (SHA-256)

Copia

Opera

Titolo (dichiarato)

Autore (dichiarato)

Anno/versione

Note (dichiarate)

Data e ora

Emesso da

**Dettagli tecnici (dimensione, stringa di attestazione)**

Dimensione

Tipo file

**Stringa di attestazione**

Scarica il certificato PDF

Scarica versione testo (.txt)

Scarica la prova blockchain (.ots)

Pagina di verifica permanente da condividere:

Copia il link

Il certificato PDF è il documento da conservare, insieme al file originale dell'opera.

Suggerimento: invialo via PEC a te stessə — alla prova matematica aggiungi una prova legale del possesso.

**Badge "Opera attestata" per il tuo sito o profilo**

Mostra che l'opera è attestata e rendi la verifica raggiungibile in un click.
Il badge resta verde finché l'opera risulta nei nostri archivi; chi lo clicca
arriva alla pagina di verifica con l'impronta già inserita.

Anteprima:

Codice HTML (per siti web)

Copia codice HTML

Markdown (per GitHub, README e simili)

Copia Markdown

## Scegli il file da controllare

Trascina qui il file ricevuto, o clicca per sceglierlo

deve essere il file originale, non il certificato PDF

**Apri il certificato PDF**

Trascina qui il certificato PDF, o clicca per sceglierlo

ne leggiamo impronta, firma e dati dichiarati

**Non hai il certificato PDF? Inserisci l'impronta manualmente**

Impronta SHA-256 (64 caratteri)

**Verifica avanzata: firma di sicurezza e dati dichiarati (dal certificato)**

Stringa di attestazione

Firma HMAC

**Dati dichiarati sul certificato (solo se presenti)**

Verifica il certificato

Esito della verifica

**Dettagli tecnici della verifica**

Hash calcolato dal file scelto

**Badge "Opera attestata" per il tuo sito o profilo**

Incorpora questo distintivo nel tuo sito o profilo: mostra che l'opera è
attestata e, con un click, porta alla verifica. Resta verde finché l'opera
risulta nei nostri archivi.

Anteprima:

Codice HTML (per siti web)

Copia codice HTML

Markdown (per GitHub, README e simili)

Copia Markdown

**Verifica blockchain (OpenTimestamps) — come si fa**

I certificati emessi dalla versione 1.7 in poi ancorano l'impronta dell'opera nella
blockchain di Bitcoin tramite il protocollo aperto OpenTimestamps: una prova di
esistenza indipendente dai nostri server, che nessuno può retrodatare.

**Procurati la prova .ots**: la scarichi dal link che compare
dopo "Scarica il certificato PDF", dall'indirizzo stampato nei "Dettagli tecnici" del
certificato, oppure — se hai inserito qui sopra l'hash dichiarato —
scaricala per l'hash inserito.

Vai su [opentimestamps.org](https://opentimestamps.org),
riquadro *Stamp & verify*.

Trascina nel riquadro il file `.ots` e poi, quando richiesto, l'opera
originale (il file esatto che hai attestato).

Esito atteso: *"Bitcoin attests data existed as of …"* con la data garantita
dalla blockchain. Nelle prime ore dopo l'emissione può comparire
*"Pending confirmation"*: la conferma definitiva matura con il blocco Bitcoin.

La verifica funziona anche offline e fra decenni: la prova dipende solo dal file
`.ots`, dall'opera originale e dalla blockchain pubblica di Bitcoin.

## Hai smarrito il certificato?

Conserviamo una copia di ogni certificato emesso. Scegli qui sopra il file
originale dell'opera (o inserisci la sua impronta) e riscarica il tuo
certificato PDF firmato, identico all'originale.

Recupera il certificato dall'archivio

Questo servizio genera l'*impronta digitale* della tua opera — qualsiasi file,
fino a 1 GB — e la lega a una data certa con un certificato PDF firmato.
L'impronta si calcola **direttamente nel tuo browser**: il file non
lascia mai il tuo dispositivo. Conservando l'attestazione potrai sempre provare
che quel preciso file esisteva, immutato, in quel momento: utile prima di
pubblicare, partecipare a un concorso o consegnare una bozza.

**Come si usa** — tre passi:

- **Trascina il file** nella scheda «Attesta».

- Il tuo browser calcola l'impronta (il file resta sul tuo dispositivo): **scarica il certificato PDF** (o il .txt) e conservalo.

- In qualsiasi momento, **verifica**: trascini di nuovo il file nella scheda «Verifica» e il servizio conferma che è identico.

**Video guida** — il servizio completo in meno di due minuti:

Il tuo browser non supporta la riproduzione video:
[scarica il video](https://spaziogenesi.org/assets/video/guida-attestazione.mp4).

### Le garanzie, in breve

Ogni riga è un vantaggio: aprila per leggere come funziona e come si verifica.

**+Impronta digitale unica

Un codice di 64 caratteri identifica il tuo file in modo univoco e irripetibile.**

L'impronta (hash **SHA-256**) è calcolata sui byte esatti del
file: basta che cambi un solo pixel — o una virgola — e l'impronta diventa completamente diversa.
Per questo dimostra che il file non è stato modificato.

Funziona con qualsiasi formato: immagini, video, audio, documenti, modelli 3D, archivi.

**+Privacy totale: il file non lascia il tuo dispositivo

L'impronta si calcola nel tuo browser: a noi arriva solo il codice, mai l'opera.**

Il calcolo dell'impronta avviene **direttamente nel tuo browser** (tecnologia
WebCrypto, standard del web): l'opera non viene caricata né trasmessa ai nostri server, che
ricevono e attestano soltanto l'impronta. Vale sia per l'attestazione sia per la verifica.

**Come si verifica:** il codice del servizio è
[open source](https://github.com/SPAZIO-GENESI/imgauthweb):
chiunque può controllare che il file non venga inviato (per esempio osservando il traffico
di rete del browser durante l'attestazione).

**+Data certa, garantita da terzi

La data di emissione è certificata da un'autorità indipendente riconosciuta da Adobe.**

Il certificato PDF include una **marca temporale** emessa da DigiCert, autorità
presente nella lista di fiducia di Adobe: la data non la dichiariamo noi, la attesta una terza parte.

**Come si verifica:** apri il PDF in Adobe Acrobat → pannello Firme →
"La firma include una marca temporale incorporata".

DigiCert · Timestamp Authority
Adobe Approved Trust List

**+Ancorata nella blockchain di Bitcoin

L'impronta viene registrata anche su Bitcoin: nessuno può retrodatarla, nemmeno noi.**

Quando generi il certificato, l'impronta viene registrata nella blockchain di Bitcoin tramite
il protocollo aperto [OpenTimestamps](https://opentimestamps.org):
una prova di esistenza che non dipende dai nostri server.

**Come si verifica:**

- Scarica il file di prova `.ots` (il link compare dopo "Scarica il certificato PDF").

- Vai su [opentimestamps.org](https://opentimestamps.org), riquadro *Stamp & verify*.

- Trascina il file `.ots` e l'opera originale: otterrai *"Bitcoin attests data existed as of…"*.

La conferma definitiva matura in poche ore dall'emissione.

Bitcoin
OpenTimestamps

**+La tua opera non viene conservata

Il file serve solo a calcolare l'impronta: non viene memorizzato né ceduto a nessuno.**

Il file viene elaborato in memoria il tempo di calcolarne l'impronta e poi scartato:
**non viene salvato, né ceduto a terzi**, né usato per altri scopi. Nei nostri
archivi resta soltanto il certificato PDF — che contiene l'impronta, non l'opera — e la prova blockchain.

**+Dati archiviati in Europa (UE)

Il certificato e la prova restano su infrastruttura con residenza dei dati nell'Unione Europea.**

Il certificato PDF e la prova di esistenza vengono conservati su storage
**Cloudflare R2 in giurisdizione Unione Europea**: i dati restano fisicamente
nell'UE, in linea con il GDPR. L'opera in sé, come detto, non viene comunque conservata.

Residenza dati UE

**+Codice aperto, verificabile da chiunque

Tutto il codice del servizio è pubblico: non devi crederci sulla parola.**

"Open source" significa che il codice che fa funzionare il servizio è pubblicato integralmente:
chiunque — anche un esperto di tua fiducia — può leggerlo e verificare che faccia esattamente ciò
che dichiara, comprese le promesse sulla non conservazione dei file. La fiducia non te la chiediamo:
te la dimostriamo.

Le chiavi crittografiche non sono nel codice: pubblicarlo non indebolisce nulla.

[Motore](https://github.com/SPAZIO-GENESI/imgauth)
[Interfaccia](https://github.com/SPAZIO-GENESI/imgauthweb)
[Firma](https://github.com/SPAZIO-GENESI/autart-signer)
Licenze GNU AGPL-3.0 · MIT

**+Verifica gratuita, per sempre, per chiunque

Chi riceve il tuo certificato può controllarlo in un click, senza registrarsi né pagare.**

Ogni certificato contiene un **QR code** e un link che aprono questa pagina con
l'impronta già compilata: chi lo riceve trascina il file e ottiene subito l'esito. La verifica
resterà sempre gratuita e aperta a tutti — è ciò che dà valore al certificato.

**+Certificato PDF firmato

Ogni attestazione produce un certificato firmato digitalmente, con QR di verifica.**

Il certificato è firmato digitalmente da **Spazio Genesi ETS** con un certificato
valido ma autonomo (emesso dall'associazione): la data è già garantita dalla marca temporale di
terza parte e dalla blockchain. Prossimamente il servizio potrà evolvere con un
**sigillo elettronico riconosciuto** anche per l'identità dell'emittente.

Se hai dichiarato titolo, autore, anno o note, questi dati sono "sigillati" nella firma di
sicurezza: dopo l'emissione nessuno può modificarli.

Stato dei servizi in tempo reale e storico a 90 giorni:
[pagina di stato](https://attestazione.spaziogenesi.org/status/).

Preferisci restare dentro Telegram? Il bot
[@SGAttestBot](https://t.me/SGAttestBot) attesta e verifica
anche lì — è un canale di **comodità**, non a privacy totale come il sito: il file che gli
invii transita per Telegram e per il nostro server (l'impronta si calcola subito e i byte vengono
scartati, nulla viene salvato). Per la privacy assoluta resta il sito.

**Nota.** Il servizio fornisce un'attestazione crittografica,
*non* una registrazione di copyright né una prova legale di proprietà.
Per saperne di più: [la pagina del servizio](https://spaziogenesi.org/servizi#attestazione)
e la [cronologia dei miglioramenti](https://attestazione.spaziogenesi.org/changelog/).

Attesta ora la tua opera
