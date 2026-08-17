---
name: verify-an-attestation
description: Check whether a file matches an attestation, whether the certificate signature is authentic, and whether the fingerprint is anchored to Bitcoin.
---

# Verify an attestation from Spazio Genesi

Verification is **always free, needs no credential and no account**. Anyone can
check any certificate.

There are three independent questions, and they are genuinely different. Answer
the ones the user actually asked, and do not let one imply another.

| Question | How | What it settles |
|---|---|---|
| Does this file match the attestation? | recompute the fingerprint **locally** | the content is unaltered |
| Is the attestation authentic and unaltered? | `POST /api/verify` | we really issued it, at that time, with those data |
| Is the fingerprint anchored to Bitcoin? | `GET /api/ots` | independent proof that survives us |

## Question 1 — does the file match? (offline, no network)

Compute the SHA-256 of the file locally and compare it, case-insensitively, with
the fingerprint on the certificate.

```bash
sha256sum thefile.pdf
```

⚠️ **The file never needs to be sent anywhere for this.** This check works even
if the service is completely offline — which is the point.

A single differing byte changes the fingerprint entirely. If they differ, the
file is not the one that was attested; there is no "almost matching".

## Question 2 — is the attestation authentic?

You need three values from the certificate: the fingerprint, the attestation
string and the HMAC signature. Send them back as `multipart/form-data`:

```http
POST https://imgauth.spaziogenesi.org/api/verify
Content-Type: multipart/form-data

hash=<sha256>
attestazione=SHA-256:<sha256>@<timestamp_iso>
hmac=<signature from the certificate>
titolo=...   (only if the certificate shows declared data)
autore=...
anno=...
note=...
```

Response:

```json
{ "hash_dichiarato": "...", "hash_calcolato": null, "coincide": null, "hmac_valido": true }
```

- `hmac_valido: true` → we issued this attestation, and neither the fingerprint,
  the timestamp nor the declared data have been altered since.
- `hmac_valido: false` → something was changed, **or** you omitted a declared
  field. Check this before reporting tampering.
- `hash_calcolato` and `coincide` are `null` because you sent no file: that is
  expected and correct. Do the comparison locally (question 1).

⚠️⚠️ **The most common false alarm.** Declared title/author/year/notes are bound
into the signature. If the certificate shows any of them and you do not pass them
back **byte-identical**, you get `hmac_valido: false` on a perfectly valid
certificate. This exact mistake produced a false "invalid signature" during a
real restore drill. Always read the declared fields off the certificate first.

The language of the certificate is irrelevant here: `/api/verify` has no `lang`
parameter, and an English and an Italian certificate of the same work carry the
**same** signature.

## Question 3 — is it anchored to Bitcoin?

```http
GET https://imgauth.spaziogenesi.org/api/ots?hash=<sha256>
```

- `200` → returns the OpenTimestamps proof (`.ots`, binary)
- `404` → no proof for that fingerprint (it may never have been certified, see
  below)

A fresh proof is **pending**: it commits to a calendar server and matures into a
Bitcoin block within hours. Verify or upgrade it with any OpenTimestamps client
(`ots verify thefile.pdf.ots`) or at <https://opentimestamps.org>. This proof
does not depend on Spazio Genesi existing in the future — that is why it is
there.

## Quick checks without parsing anything

**Is this fingerprint in the archive at all?**

```http
GET https://attestazione.spaziogenesi.org/c/<sha256>
```

`200` → public verification page with date, algorithm, anchor status and declared
data. `404` → not in the archive. ⚠️ A 404 does **not** mean nothing was ever
attested: a caller may have created an attestation without ever requesting the
certificate, in which case nothing was archived. Add `?lang=en` for English.

**Embeddable badge** (never returns an HTTP error, so it cannot break a page):

```http
GET https://imgauth.spaziogenesi.org/api/badge?hash=<sha256>
```

Green only if the fingerprint is genuinely in the archive; grey otherwise.

**Recover a lost certificate** — the archived PDF, for anyone who knows the
fingerprint:

```http
GET https://imgauth.spaziogenesi.org/api/cert?hash=<sha256>
```

## Reading the values out of a PDF certificate

If the user has only the PDF, the three values are in its text layer: the
fingerprint (64 hex characters), the attestation string starting with `SHA-256:`,
and the HMAC signature — which is **base64, not hexadecimal**. Extract text with
any PDF library and match those patterns; the declared data, when present, sit in
a block labelled as author-declared.

## How to report the result

Say which of the three questions you actually checked. "Verified" without
qualification is misleading: a matching fingerprint with an unchecked signature,
or a valid signature on a file you never hashed, are different situations. If the
signature is valid but the file does not match, the certificate is authentic and
the file is not the attested one — say exactly that.

## See also

- Attesting: `/.well-known/agent-skills/attest-a-file/SKILL.md`
- Live service status: <https://imgauth.spaziogenesi.org/api/status>
- What the system does and does not guarantee:
  <https://attestazione.trust.spaziogenesi.org/whitepaper-v1.0.pdf>
