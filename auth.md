# auth.md

How software agents and programs obtain credentials for the attestation API of
**Spazio Genesi ETS** (`https://imgauth.spaziogenesi.org`).

Human-readable pages: <https://attestazione.spaziogenesi.org/developer/> ·
API description: <https://imgauth.spaziogenesi.org/openapi.json>

## Who needs a credential

**Verification never needs one.** Checking a fingerprint, a certificate
signature, a Bitcoin anchor or the service status is free, anonymous and
unauthenticated — by design, because a proof nobody can check independently is
not a proof.

A credential is needed only to **create** an attestation (`POST /api/hash`), and
it grants exactly one thing: it replaces the anti-bot challenge a browser would
have to clear. It does not weaken anything else — the server-side timestamp, the
HMAC signature and the per-IP rate limits apply identically.

## What this service does not have

Stated plainly, so no client wastes time looking for it:

- **No OAuth authorization server.** There is no `/.well-known/openid-configuration`
  and no `/.well-known/oauth-authorization-server`, and there will not be one
  while none exists. OAuth is used only as a *client*, one-shot, to read a
  verified email address from Google, Microsoft or LinkedIn — no session is
  created, and the provider's token is discarded immediately after that single
  call.
- **No dynamic client registration**, no `client_id`, no client secret.
- **The device authorization flow below is not RFC 8628.** It is a small
  purpose-built flow. Do not point an RFC 8628 client at it.
- **No `/.well-known/oauth-protected-resource`.** That document requires listing
  the authorization servers able to issue tokens for this resource, and there are
  none.

## Option A — device flow (no identity, recommended for agents)

No email, no registration. Best when a human is present at setup time.

**1. Request a code**

```http
POST https://imgauth.spaziogenesi.org/api/agent/authorize
```

```json
{ "code": "...", "verification_url": "https://attestazione.spaziogenesi.org/agent/authorize?code=...", "expires_in": 600, "interval": 3 }
```

**2. A human opens `verification_url`** and clears an anti-bot challenge.
⚠️ **This step is intentionally not automatable.** The challenge exists so that
an attestation corresponds to someone who actually asked for it; an attestation
minted by an unattended machine would not carry the same meaning. Add
`&lang=en` for the English page.

**3. Poll for the token**

```http
GET https://imgauth.spaziogenesi.org/api/agent/token?code=<code>
```

| Response | Meaning |
|---|---|
| `{"status":"pending"}` | not yet approved — wait `interval` seconds |
| `{"status":"approved","token":"sg_s_…"}` | **delivered exactly once**: store it now |
| `{"status":"claimed"}` | already collected, and not retrievable again |
| `410 {"status":"expired"}` | the code expired (10 minutes) — start over |

**Token properties:** prefix `sg_s_`, valid **24 hours**, **20 attestations**
total, not renewable — request a new one when it expires.

## Option B — API key (identified, longer lived)

Obtained once, in a browser, at
<https://attestazione.spaziogenesi.org/developer/keys/> by verifying an email
address with Google, Microsoft or LinkedIn.

**Key properties:** prefix `sg_k_`, **does not expire**, **50 attestations per
month** (resets monthly), one active key per email address. The key is displayed
once and never again — only its hash is stored.

Higher quotas, institutional agreements and shared pools (universities, art
academies, software vendors) are arranged by writing to `it@spaziogenesi.org`.
See <https://attestazione.spaziogenesi.org/condizioni/>.

## Using the credential

```http
POST https://imgauth.spaziogenesi.org/api/hash
Authorization: Bearer sg_s_...
```

Works identically for `sg_s_` and `sg_k_`.

⚠️ **Never pass a credential as a command-line argument or as a tool parameter.**
It would be recorded in shell history, visible in process listings, and — for an
AI agent — retained in the model's context. Use an environment variable.

**Revocation:** write to `it@spaziogenesi.org`. Session tokens also expire on
their own within 24 hours.

## Errors

| Status | Meaning |
|---|---|
| 400 | no credential and no anti-bot token, or malformed request |
| 403 | credential invalid, revoked or expired |
| 429 | rate limit (60/min on `/api/hash`, 10/min on `/api/cert-pdf`) or quota exhausted |
| 503 | signing not configured server-side (transient) |

A spent shared quota produces a **lower tier**, not a refusal: the response
reports `fascia` and `fascia_motivo`, and the attestation is still issued and
still fully valid.

## Privacy

For the device flow: **no personal data at all** — no email, no account, no
identity. For an API key: the verified email address and which provider verified
it, kept while the key is active and for 180 days after revocation, then
anonymised. No provider tokens are ever stored, no cookies, no marketing.
Full notice: <https://attestazione.spaziogenesi.org/privacy.html> (§3.5).

The work being attested is never sent: the client computes its SHA-256
fingerprint locally, and only that fingerprint reaches the API.

## Security contact

Vulnerability reports: see <https://attestazione.spaziogenesi.org/.well-known/security.txt>
and the policy at <https://attestazione.spaziogenesi.org/sicurezza/>.
