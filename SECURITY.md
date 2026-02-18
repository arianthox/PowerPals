# Security Model

## Credential handling

- Secrets are stored exclusively in the OS credential vault via `keytar`.
- `credentialService` is the only write/read path for provider credentials.
- SQLite stores only non-secret credential references (`credentialRef`).
- No secrets are written to renderer storage (`localStorage`, IndexedDB, config files).

## Redaction policy

- Logger performs automatic redaction for:
  - Authorization headers
  - API keys
  - session cookies
  - token/cookie-like fields
- Redaction is recursive across nested objects/arrays.
- Debug logging is gated behind settings and still redacted.

## Threat model

Primary risks addressed:

- Local plaintext secret exposure
  - Mitigated by OS vault storage only.
- Secret leakage through logs
  - Mitigated by structured redaction policy.
- Renderer privilege escalation into Node
  - Mitigated with context isolation + preload bridge + disabled node integration.
- Sync instability or repeated API faults
  - Mitigated with per-account backoff and failure notifications.

## Known limitations

- Provider official endpoints are not implemented yet; manual mode is the reliable path currently.
- Local machine compromise can still expose data available to the logged-in OS user.
- Certificate pinning and advanced anti-tampering controls are out of scope for this version.
