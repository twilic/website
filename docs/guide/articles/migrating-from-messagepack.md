# Migrating from MessagePack

If your team already ships MessagePack on internal boundaries, you have done the hard organizational work: stakeholders accept binary payloads, SDKs are integrated, and operational playbooks exist. Twilic migration is an **incremental compression upgrade**, not a greenfield format change.

This guide covers when the switch is worth it, how to run a safe parallel rollout, and what to watch for in production.

## Should You Migrate?

Migrate when MessagePack is **working but plateaued** — especially if benchmarks show key repetition dominates your payloads.

| Signal | Migrate? |
| --- | --- |
| Bulk/list payloads with same object shape | **Yes** — Twilic Batch shines |
| Long-lived streams with mostly stable fields | **Yes** — Stateful patches |
| Columnar telemetry batches | **Yes** — `col_batch` |
| Single one-off maps, no batching | **Maybe not** — gains are small |
| Embedded/constrained env with tiny MessagePack lib | **Evaluate SDK size first** |
| Public API on MessagePack | **Unlikely** — prefer JSON or Protobuf for externals |

Run a benchmark on **production-shaped data** before committing:

```bash
git clone https://github.com/twilic/examples.git
cd examples
pnpm install
# Pick the closest example:
pnpm example:api-response      # list APIs
pnpm example:telemetry         # event batches
pnpm example:websocket:simulate # streaming patches
pnpm example:cache-payload     # cache objects
```

See also the [Benchmark](/benchmark) page for throughput numbers.

## What Stays the Same

Twilic Dynamic mode shares MessagePack's mental model:

- Self-describing values: null, bool, int, float, string, binary, array, map
- No schema required for first adoption
- Polyglot SDKs — encode in one language, decode in another
- Binary wire format (not human-readable)

Your application logic — domain objects, REST routes, cache keys — does not need to change shape.

## What Gets Better

| MessagePack limitation | Twilic capability |
| --- | --- |
| Field names in every map | Shape + key interning per message |
| Repeated strings in batches | String interning |
| Homogeneous numeric arrays as tagged values | Typed vectors + delta/XOR/RLE codecs |
| Full object every stream tick | Stateful field patches |
| No columnar mode | `col_batch` for telemetry |

## Parallel Rollout Playbook

Borrow the pattern used in large-scale MessagePack cache migrations (e.g. six-month parallel encode with fallback):

### Phase 1 — Encode comparison (1–2 weeks)

- Sample production payloads (anonymized)
- Encode with MessagePack and Twilic side by side
- Record size ratio at realistic batch sizes
- Share results with service owners

### Phase 2 — Dual decode (2–4 weeks)

- Deploy decoders that accept **both** formats
- Use a version byte or `Content-Type` to distinguish:

```text
0x01 → legacy MessagePack
0x02 → Twilic v2 Dynamic
```

- Producers stay on MessagePack; validate decode path only

### Phase 3 — Canary encode (2–4 weeks)

- One low-risk producer switches to Twilic (read-heavy internal API or forwarder tier)
- Monitor error rates, latency, consumer lag
- Keep instant rollback to MessagePack encode

### Phase 4 — Expand + enable Batch/Stateful

- Roll encode forward service by service
- Enable `encodeBatch` where responses are lists
- Enable `SessionEncoder` on WebSocket routes after client updates ship

### Phase 5 — Retire MessagePack

- Remove dual-decode after all producers migrate
- Document the format in your internal platform standards

## Compatibility Checklist

| Item | Action |
| --- | --- |
| Map key type | Prefer string keys for cross-language stability |
| Extension types | Map MessagePack ext types to Twilic extensions or embed as `bin` during transition |
| Timestamp encoding | Align on Twilic timestamp representation in Bound/Dynamic docs |
| Max payload size | Set decode limits in every SDK |
| Untrusted input | Never typeless-decode; allowlist expected shapes at boundaries |
| Golden tests | Store byte fixtures for both formats during dual period |

## Key and Schema Strategy

MessagePack teams often debate int keys vs string keys. Twilic follows the same discipline:

- **String keys** — best for versioning, cross-team contracts, JSON interop
- **Int keys / array maps** — acceptable in closed hot paths with codegen
- **Version byte prefix** — recommended for cache and queue payloads

Document your choice in an internal RFC before wide rollout.

## Debugging During Migration

Binary migration pain is invisible payloads. Mitigate upfront:

- **Sampled JSON sidecars** in staging (never log full production PII)
- **Hex dump tools** in your internal CLI
- **Twilic Playground** for reproducing fixtures — [Playground](/guide/playground)
- **Size metrics** per endpoint: `msgpack_bytes` vs `twilic_bytes` histogram

## Rollback Plan

Keep MessagePack encode for one release behind a feature flag:

```ts
const bytes = featureFlags.twilicEncode
  ? twilic.encodeBatch(records)
  : msgpack.encode(records);
```

Rollback is flipping the flag — no data migration required if dual-decode was deployed.

## When Not to Migrate

Stay on MessagePack if:

- Payloads are already small enough for your SLOs and budget
- You depend on a minimal C/embedded MessagePack implementation with no Twilic port
- Your bottleneck is business logic, not serialization

Twilic is an optimization, not a mandate.

## Next Steps

- [Building the Adoption Business Case](/guide/articles/building-the-adoption-business-case)
- [Comparison — Twilic vs MessagePack](/guide/comparison#twilic-vs-messagepack)
- [Enterprise Use Cases](/guide/enterprise-use-cases)
- [Quick Start](/guide/quick-start)
