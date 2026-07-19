# Interoperability

Twilic interoperability requires both sides to agree on version and profile. The current specification family is v3. Rust, Go, JavaScript, and Zig are on the v3 interop line; other published SDKs remain on v2 until their v3 support lands.

## The interoperability contract

```text
Rust encoder  →  [bytes]  →  Go decoder     ✓ (v3)
JS encoder    →  [bytes]  →  Zig decoder    ✓ (v3)
Python batch  →  [bytes]  →  Java decode    ✓ (v2)
JS stateful   →  [bytes]  →  Rust session   ✓ (with matching session state and wire line)
```

Requirements:

- Both sides implement the same Twilic version/profile (`v3` among Rust/Go/JS/Zig, `v2` among the remaining SDKs, or an explicitly negotiated mix)
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
0x03 = Twilic v3 Dynamic
0x02 = Twilic v2 Dynamic
0x01 = legacy MessagePack (during migration)
```

Decoders branch on the first byte. See [Migrating from MessagePack](/guide/articles/migrating-from-messagepack).

## v2 vs v3

v3 is a clean break from v2 for Bound Profile field/record-body payloads. Dynamic Profile may remain v2-compatible where tags are unchanged, but implementations that support both versions must use an explicit external profile and version discriminator. Payload auto-detection is not defined.

- [v3 Specification](/spec/v3)
- [v2 Legacy Specification](/spec/v2)

## v1 vs v2

v2 is a clean break. A v2 decoder is **not required** to decode v1 payloads. Deploy v1 and v2 decoders in parallel during migration:

- [v1 → v2 Migration Runbook](/guide/migration-v1-to-v2)
- [v2 Legacy Specification](/spec/v2)
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
