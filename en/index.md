> This is a text rendition of an interactive page: the controls (choosing a
> file, form fields, buttons) do not exist here. To use the service from a
> program, the machine-oriented resources are a better fit:
>
> - operating instructions: <https://attestazione.spaziogenesi.org/.well-known/agent-skills/index.json>
> - credentials: <https://attestazione.spaziogenesi.org/auth.md>
> - API contract: <https://imgauth.spaziogenesi.org/openapi.json>
> - site map: <https://attestazione.spaziogenesi.org/llms.txt>

Free · open source · no registration

# Attestation for *digital works*

Prove that your work existed today, exactly as it is:
choose the file, get a certificate to keep. Free, in a minute —
and the file never leaves your device.

The file stays with you
Any format, up to 1 GB
Verification free, forever

The service provides cryptographic attestation of the digital
fingerprint (hash) of computer files. It doesn't constitute copyright registration
or legal certification of ownership of the work.

Attesting regularly? There's the [Professional tier](https://attestazione.spaziogenesi.org/en/professionale/):
200 attestations a month and 5-year custody — on promotion at €20 a year until the end of 2026.

You can install this page as an app: from your browser menu choose
"Add to Home screen" (or "Install app").

**What's a fingerprint? Watch it live**

The fingerprint, live

This is a SHA-256 fingerprint, computed in your
browser. Change just one letter above and it changes completely: that's why it proves
a file has stayed exactly as it was.

## Choose your work

any file, up to 1 GB

Drag the file here, or click to choose it

Any format — the fingerprint is computed in your browser, the file is never sent

## Describe the work

optional

**Add title, author, year and notes — they'll appear on the certificate**

This data appears on the certificate as the author's declarations and is bound
to the security signature: it can't be changed after issuance.

Title of the work

Author or pseudonym

Year or version

Notes

## Generate the attestation

**Have an agreement or a Professional subscription? Sign in with your email**

If your academy, institution or company has an agreement with Spazio Genesi —
or if you have a Professional subscription — verify your email: attestations will
be automatically recognized under your tier, with a stronger guarantee of
certificate custody. No password, no account: a single one-shot sign-in, valid
for this browser session.

[Continue with Google](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=google&purpose=attest)
[Continue with Microsoft](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=microsoft&purpose=attest)
[Continue with LinkedIn](https://imgauth.spaziogenesi.org/api/dev/oauth/start?provider=linkedin&purpose=attest)

Sign out

Generate SHA-256 attestation

✓ Your work is attested

Digital fingerprint (SHA-256)

Copy

Work

Title (declared)

Author (declared)

Year/version

Notes (declared)

Date and time

Issued by

**Technical details (size, attestation string)**

Size

File type

**Attestation string**

Download the PDF certificate

Download text version (.txt)

Download the blockchain proof (.ots)

Permanent verification page to share:

Copy the link

The PDF certificate is the document to keep, together with the original file of the work.

Tip: send it to yourself by registered/certified mail — add legal proof of possession to the mathematical proof.

**"Attested work" badge for your site or profile**

Show that the work is attested and make verification reachable in one click.
The badge stays green as long as the work is in our archives; anyone who clicks
it lands on the verification page with the fingerprint already filled in.

Preview:

HTML code (for websites)

Copy HTML code

Markdown (for GitHub, README and similar)

Copy Markdown

## Choose the file to check

Drag in the file you received, or click to choose it

it must be the original file, not the PDF certificate

**Open the PDF certificate**

Drag in the PDF certificate, or click to choose it

we read its fingerprint, signature and declared data

**Don't have the PDF certificate? Enter the fingerprint manually**

SHA-256 fingerprint (64 characters)

**Advanced verification: security signature and declared data (from the certificate)**

Attestation string

HMAC signature

**Data declared on the certificate (only if present)**

Verify the certificate

Verification result

**Technical details of the verification**

Hash computed from the chosen file

**"Attested work" badge for your site or profile**

Embed this badge on your site or profile: it shows the work is
attested and, with one click, leads to verification. It stays green as long
as the work is in our archives.

Preview:

HTML code (for websites)

Copy HTML code

Markdown (for GitHub, README and similar)

Copy Markdown

**Blockchain verification (OpenTimestamps) — how to**

Certificates issued from version 1.7 onward anchor the work's fingerprint in the
Bitcoin blockchain via the open OpenTimestamps protocol: proof of existence
independent of our servers, which no one can backdate.

**Get the .ots proof**: download it from the link that appears
after "Download the PDF certificate", from the address printed in the certificate's
"Technical details", or — if you entered the declared hash above —
download it for the entered hash.

Go to [opentimestamps.org](https://opentimestamps.org),
the *Stamp & verify* panel.

Drag the `.ots` file into the panel, then, when asked, the original
work (the exact file you attested).

Expected result: *"Bitcoin attests data existed as of …"* with the date
guaranteed by the blockchain. In the first hours after issuance you may see
*"Pending confirmation"*: the final confirmation matures with the Bitcoin block.

Verification works offline too, and decades from now: the proof depends only on the
`.ots` file, the original work, and the public Bitcoin blockchain.

## Lost your certificate?

We keep a copy of every certificate issued. Choose the original file of the work
above (or enter its fingerprint) and re-download your signed PDF certificate,
identical to the original.

Retrieve the certificate from the archive

This service generates the *digital fingerprint* of your work — any file,
up to 1 GB — and ties it to a certain date with a signed PDF certificate.
The fingerprint is computed **directly in your browser**: the file
never leaves your device. By keeping the attestation you'll always be able to
prove that exactly that file existed, unchanged, at that moment: useful before
publishing, entering a competition, or delivering a draft.

**How to use it** — three steps:

- **Drag the file** into the «Attest» tab.

- Your browser computes the fingerprint (the file stays on your device): **download the PDF certificate** (or the .txt) and keep it.

- At any time, **verify**: drag the file again into the «Verify» tab and the service confirms it's identical.

**Video guide** — the whole service in under two minutes:

Your browser doesn't support video playback:
[download the video](https://spaziogenesi.org/assets/video/guida-attestazione.mp4).

### The guarantees, in brief

Each line is a benefit: open it to read how it works and how to verify it.

**+A unique digital fingerprint

A 64-character code identifies your file uniquely — it can't be repeated by chance.**

The fingerprint (**SHA-256** hash) is computed on the exact bytes of the
file: change just one pixel — or one comma — and the fingerprint becomes completely different.
That's why it proves the file hasn't been modified.

It works with any format: images, video, audio, documents, 3D models, archives.

**+Total privacy: the file never leaves your device

The fingerprint is computed in your browser: only the code reaches us, never the work.**

The fingerprint is computed **directly in your browser** (WebCrypto
technology, a web standard): the work is never sent to our servers, which
receive and attest only the fingerprint. This holds for both attestation and verification.

**How to verify it:** the service's code is
[open source](https://github.com/SPAZIO-GENESI/imgauthweb):
anyone can check that the file is never sent (for example by watching the browser's
network traffic during attestation).

**+A certain date, guaranteed by a third party

The issuance date is certified by an independent authority recognized by Adobe.**

The PDF certificate includes a **timestamp** issued by DigiCert, an authority
on Adobe's trust list: we don't declare the date ourselves — a third party attests it.

**How to verify it:** open the PDF in Adobe Acrobat → Signatures panel →
"The signature includes an embedded timestamp."

DigiCert · Timestamp Authority
Adobe Approved Trust List

**+Anchored in the Bitcoin blockchain

The fingerprint is also recorded on Bitcoin: no one can backdate it, not even us.**

When you generate the certificate, the fingerprint is recorded in the Bitcoin blockchain via
the open [OpenTimestamps](https://opentimestamps.org) protocol:
proof of existence that doesn't depend on our servers.

**How to verify it:**

- Download the `.ots` proof file (the link appears after "Download the PDF certificate").

- Go to [opentimestamps.org](https://opentimestamps.org), the *Stamp & verify* panel.

- Drag in the `.ots` file and the original work: you'll get *"Bitcoin attests data existed as of…"*.

The final confirmation matures within a few hours of issuance.

Bitcoin
OpenTimestamps

**+Your work is not kept

The file is used only to compute the fingerprint: it's never stored or handed to anyone.**

The file is processed in memory for the time it takes to compute its fingerprint, then discarded:
**it's never saved, nor handed to third parties**, nor used for any other purpose. In our
archives, only the PDF certificate — which contains the fingerprint, not the work — and the blockchain proof remain.

**+Data stored in Europe (EU)

The certificate and proof stay on infrastructure with data residency in the European Union.**

The PDF certificate and the proof of existence are stored on
**Cloudflare R2 in the European Union jurisdiction**: the data physically stays
in the EU, in line with the GDPR. The work itself, as noted, isn't kept in any case.

EU data residency

**+Open code, verifiable by anyone

All the service's code is public: you don't have to take our word for it.**

"Open source" means the code that runs the service is published in full:
anyone — even an expert you trust — can read it and verify it does exactly what
it claims, including the promises about not keeping files. We don't ask for your
trust: we demonstrate it.

The cryptographic keys aren't in the code: publishing it doesn't weaken anything.

[Engine](https://github.com/SPAZIO-GENESI/imgauth)
[Interface](https://github.com/SPAZIO-GENESI/imgauthweb)
[Signing](https://github.com/SPAZIO-GENESI/autart-signer)
GNU AGPL-3.0 · MIT licenses

**+Free verification, forever, for anyone

Anyone who receives your certificate can check it in one click, with no registration or payment.**

Every certificate contains a **QR code** and a link that open this page with
the fingerprint already filled in: whoever receives it drags in the file and gets the result
right away. Verification will always stay free and open to everyone — that's what gives the
certificate its value.

**+Signed PDF certificate

Every attestation produces a digitally signed certificate, with a verification QR code.**

The certificate is digitally signed by **Spazio Genesi ETS** with a valid but
self-issued certificate (issued by the association itself): the date is already guaranteed by
the third-party timestamp and by the blockchain. In the future the service may evolve with a
**recognized electronic seal** for the issuer's identity too.

If you declared a title, author, year or notes, this data is "sealed" into the security
signature: no one can change it after issuance.

Real-time service status and 90-day history:
[status page](https://attestazione.spaziogenesi.org/status/).

Prefer to stay inside Telegram? The bot
[@SGAttestBot](https://t.me/SGAttestBot) attests and verifies
there too — it's a **convenience** channel, not full-privacy like the site: the file you
send it passes through Telegram and our server (the fingerprint is computed right away and the bytes
are discarded, nothing is saved). For absolute privacy, use the site.

**Note.** The service provides a cryptographic attestation,
*not* a copyright registration or legal proof of ownership.
To learn more: [the service page](https://spaziogenesi.org/servizi#attestazione)
and the [changelog](https://attestazione.spaziogenesi.org/changelog/).

Attest your work now
