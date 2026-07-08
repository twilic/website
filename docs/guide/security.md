# Security

Twilic is designed for internal, machine-to-machine communication. At trust boundaries — public APIs, user-uploaded content, compromised peer services — apply the same discipline as any binary serialization format.

## Trust zones

```text
[Trusted]                    [Boundary]              [Untrusted]
App-generated cache    →     Internal API      →     Public REST (JSON)
Agent telemetry        →     Service mesh      →     User uploads
Session state (auth'd) →     WebSocket (auth)  →     Anonymous endpoints
```

Twilic belongs in the **trusted → boundary** zone. Keep **untrusted → boundary** on JSON or validated Protobuf.

## Decode limits

All v2 decoders enforce safety limits. See [Errors & Limits](/reference/errors-and-limits).

| Limit        | Protects against                                |
| ------------ | ----------------------------------------------- |
| Decode depth | Stack exhaustion from nested structures         |
| Decode count | Allocation bombs from fake array/map lengths    |
| Output ratio | Decompression bombs (small input → huge output) |

### JavaScript

```ts
import { TwilicDecodeError, DEFAULT_MAX_DECODE_DEPTH } from "@twilic/core";

try {
  decode(untrustedBytes);
} catch (e) {
  if (e instanceof TwilicDecodeError) {
    // reject — do not retry with larger limits
  }
}
```

### Application-level size cap

Always cap payload size **before** decode:

```ts
const MAX_BODY = 1_048_576; // 1 MiB

app.post("/data", twilicParser(), (req, res) => {
  // enforce at reverse proxy or middleware before parser
});
```

## Untrusted input rules

1. **Never decode unauthenticated user uploads as Twilic** without strict size limits
2. **Do not use typeless or dynamic-type deserialization** on attacker-controlled bytes
3. **Allowlist expected shapes** at the application layer after decode
4. **Keep patch/version dependencies out of public endpoints**
5. **Patch SDKs** when security advisories are published for your language binding

## Stateful session security

Session state is an attack surface if an attacker can inject frames:

- Authenticate WebSocket connections before accepting Twilic frames
- Rate-limit frame frequency per connection
- Reset session on repeated decode errors
- Do not expose raw Twilic decode endpoints to the public internet

## HTTP integration hardening

```ts
// Default: reject wrong Content-Type (recommended)
twilicParser({ requireContentType: true });

// Only on authenticated internal routes behind network policy
twilicParser({ requireContentType: false });
```

Place Twilic routes behind:

- Service mesh mTLS
- API gateway authentication
- Internal network segmentation

## Debugging vs production

Transport-JSON conversion (`decodeToTransportJson`) is useful for debugging but expands attack surface if exposed on production paths processing untrusted bytes. Restrict to:

- Staging environments
- Sampled logging (no PII)
- Internal admin tools with auth

## Comparison with other formats

| Format | Untrusted input risk |
| --- | --- |
| JSON | Lower (no arbitrary type instantiation) but billion-laughs / deep nesting possible |
| MessagePack | Type confusion, ext type bombs — needs limits |
| Twilic | Same class of risks — needs limits |
| Protobuf | Schema constrains types; unknown field skip |

No binary format is safe by default at a public boundary.

## Checklist

- [ ] Twilic only on internal/authenticated routes
- [ ] Max body size enforced before decode
- [ ] Decode errors logged and rate-limited
- [ ] SDK versions pinned and monitored for advisories
- [ ] Stateful sessions require authenticated channels
- [ ] Public API remains JSON or governed Protobuf
- [ ] Incident runbook includes binary payload inspection via CLI

## Related

- [Errors & Limits](/reference/errors-and-limits)
- [Troubleshooting](/guide/troubleshooting)
- [Security article context](/guide/articles/internal-apis-without-protobuf-overhead)
