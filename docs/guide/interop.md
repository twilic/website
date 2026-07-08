# Interoperability

Twilic v2 guarantees that any conforming encoder output is decodable by any conforming decoder — regardless of language, profile, or SDK version within the v2 line.

## The interoperability contract

```text
Rust encoder  →  [bytes]  →  Go decoder     ✓
Python batch  →  [bytes]  →  JS decode       ✓
JS stateful   →  [bytes]  →  Rust session    ✓ (with matching session state)
```

Requirements:

- Both sides implement **Twilic v2** reference profile
- Same profile used (Dynamic decodes Dynamic; session patches need session decoder)
- Field maps use **string keys** for cross-language stability

## Cross-language smoke test

### Rust producer → Go consumer

```rust
// producer.rs
use twilic::{encode, Value};
let value = Value::Map(vec![
    ("event".into(), Value::String("user.signup".into())),
    ("user_id".into(), Value::U64(9001)),
]);
let bytes = encode(&value)?;
std::fs::write("event.twl", &bytes)?;
```

```go
// consumer.go
data, _ := os.ReadFile("event.twl")
value, err := twilic.Decode(data)
```

Works across all 18 official SDKs without a shared schema file in Dynamic mode.

## Shared test fixtures

The Twilic monorepo maintains cross-language conformance fixtures. Run interop checks per SDK:

```bash
# Python
cd twilic-python && ./scripts/check-interop.sh

# Rust (reference)
cd twilic-rust && cargo test

# JavaScript
cd twilic-js && pnpm test
```

## Profile-specific interop

| Profile | Interop notes |
| --- | --- |
| Dynamic | Full cross-language; no shared state |
| Batch | Decoder must expect batch message kind |
| Bound | Encoder and decoder must share identical schema |
| Stateful | Decoder must maintain matching session; patches are not self-contained |

## Version bytes

Prefix application payloads with a format version for multi-format pipelines:

```text
0x02 = Twilic v2 Dynamic
0x01 = legacy MessagePack (during migration)
```

Decoders branch on the first byte. See [Migrating from MessagePack](/guide/articles/migrating-from-messagepack).

## v1 vs v2

v2 is a clean break. A v2 decoder is **not required** to decode v1 payloads. Deploy v1 and v2 decoders in parallel during migration:

- [v1 → v2 Migration Runbook](/guide/migration-v1-to-v2)
- [v2 Specification](/spec/v2)
- [v1 Legacy](/spec/v1)

## Common interop failures

| Symptom | Cause |
| --- | --- |
| Decode error on valid bytes | v1 payload sent to v2 decoder |
| Missing fields | Schema mismatch (Bound profile) |
| Patch decode failure | Session state not synchronized |
| Integer type mismatch | JS `number` vs `bigint` — use `bigint` for u64/i64 |
| Key order differences | Maps are unordered — compare semantically |

## Integer handling across languages

| Language   | u64/i64 type                           |
| ---------- | -------------------------------------- |
| JavaScript | `bigint`                               |
| Python     | `int`                                  |
| Go         | `uint64` / `int64` via constructors    |
| Rust       | `u64` / `i64` enum variants            |
| Java       | `long` / `BigInteger` depending on SDK |

JavaScript encoders must use `bigint` for values outside `Number.MAX_SAFE_INTEGER`.

## Related

- [Conformance & Testing](/guide/conformance)
- [Cookbook — Multi-Language Interoperability](/guide/cookbook#multi-language-interoperability)
- [Spec — Overview](/spec/overview)
- [Troubleshooting](/guide/troubleshooting)
