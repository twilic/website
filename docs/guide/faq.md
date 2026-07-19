# FAQ

## General

### Is Twilic stable?

The current specification family is v3, and implementations are required to be deterministic and interoperable within the explicitly selected version/profile. Rust, Go, JavaScript, and Zig ship v3 by default. Other published SDKs remain on v2 until their v3 support lands.

v3 is a clean break from v2 for Bound Profile field/record-body payloads. Dynamic Profile may remain v2-compatible where tags are unchanged.

### Is Twilic production-ready?

The v3 specification is finalized. The reference implementations (Rust, Go, JavaScript via Rust, Zig) are conformance-tested against the v3 profile, including `BOUND_STREAM` and `SCHEMA_BATCH`. The remaining official SDKs are conformance-tested against shared v2 binary fixtures until their v3 support lands.

### Does Twilic support streaming?

Twilic operates on messages, not streams. However:

- Any reliable, ordered channel (WebSocket, gRPC stream, TCP) can carry a sequence of Twilic messages.
- The Stateful Profile provides session-level compression across messages on such channels.
- Twilic does not define a framing protocol — use length-prefixed framing or a transport that handles message boundaries.

### Can I use Twilic over HTTP?

Yes. Use the Dynamic or Batch Profile in stateless mode. Official JavaScript integrations use `Content-Type: application/vnd.twilic`. See [Web Integrations](/guide/web-integrations) for Express, Fastify, Hono, Axios, and Fetch helpers.

Stateful Profile is not appropriate for HTTP request/response because there is no shared persistent session state.

### Is there a text/debug format?

Twilic is a binary format. There is no normative text representation. For debugging, decode to the value tree and serialize to JSON for inspection. The SDKs provide `decode` → standard value tree → JSON serialization as a standard pattern.

---

## Encoding

### How is `null` encoded?

`null` is the single byte `0xC0`. This is the same as MessagePack's nil.

### How are integers encoded?

Integers use the smallest valid width:

- `-32..127`: fixint (1 byte)
- `-128..-33`: `i8` (2 bytes)
- `128..255`: `u8` (2 bytes)
- And so on, up to `i64` / `u64` (9 bytes)

This means small common values like `0`, `1`, `true`, `false` are very compact.

### How are 64-bit integers handled in JavaScript?

JavaScript's `Number` type cannot represent all `u64` values safely (values above `2^53 - 1` lose precision). The JS SDK decodes `u64` and `i64` as `bigint` by default. Encode with `BigInt` literals:

```ts
const value = { counter: 9007199254740993n }; // safe as bigint
```

### What is varuint?

Twilic uses a variable-length unsigned integer encoding (Twilic-PV) for metadata fields: lengths, IDs, and counts. v3 also uses Twilic-PV for Bound integer fields whose physical encoding is `varuint` or `zigzag_varuint`. It works like LEB128:

- If the high bit of a byte is 0, that byte completes the value.
- If the high bit is 1, more bytes follow.

Dynamic scalar integers use fixints or the smallest valid fixed-width integer tags. Bound integer payloads use the physical encoding declared by schema/profile: `varuint`, `zigzag_varuint`, `range_bits`, or `fixed_le`.

### Can I encode arbitrary binary data?

Yes. Use the `bin8`, `bin16`, or `bin32` types. There is no base64 step. Binary data is sent as raw bytes with a length prefix.

```rust
let value = Value::Binary(vec![0xDE, 0xAD, 0xBE, 0xEF]);
```

### Does the encoder choose codecs automatically?

Yes. In Dynamic Profile, the encoder detects homogeneous arrays and selects `typed_vec` automatically. In `col_batch` or v3 `SCHEMA_BATCH`, each column's codec is chosen based on the column's value statistics. The selection is deterministic for the same input, profile, schema, and negotiated codec set.

---

## Interning

### When do intern tables reset?

Intern tables (`key_id`, `str_id`, `shape_id`) reset at each **top-level message boundary**. They are never shared across messages. This is a hard requirement for stateless decoding.

### How many keys can be interned per message?

There is no hard limit in the spec. IDs are varuint-encoded, so any number of keys can be interned. In practice, most messages have fewer than 64 distinct keys.

### Does string interning affect keys or values?

Both. `key_ref` interns map key strings. `str_ref` interns string values. They use separate ID spaces.

### What if a `key_ref` or `str_ref` references an unknown ID?

This is a hard decode error. The decoder must fail immediately. Unknown references are never silently accepted.

---

## Stateful Mode

### What happens if I lose sync with the receiver?

Send `RESET_STATE` immediately. Both sender and receiver invalidate all session state. The sender then emits a stateless full frame (or fresh base/template registration) before resuming stateful references.

### Can I use stateful mode over a message queue?

Generally no. Stateful mode requires ordered, reliable delivery with no silent drops of reset or registration frames. Most message queues can reorder or drop messages. Use stateless mode for queues.

### Is stateful mode backward-compatible?

Receivers that do not implement stateful mode will fail to decode `state_patch` and `template_batch` frames. Stateful mode must be negotiated out-of-band (e.g., via connection handshake or application configuration). Implementations that don't support stateful mode MUST reject stateful frames with a clear error, not silently ignore them.

---

## Interoperability

### How do I verify cross-SDK compatibility?

The `benchmark` and `twilic` repositories include binary fixtures generated by the Rust reference implementation. v3 SDKs (Rust, Go, JavaScript, Zig) should be verified against the v3 reference profile, including `BOUND_STREAM`, `SCHEMA_BATCH`, compact Bound payloads, and negotiated extension handling. Other published SDKs run conformance tests against v2 fixtures until their v3 support lands.

### Can I use Twilic between services written in different languages?

Yes. This is a primary design goal. Prefer matching wire lines on both sides: v3↔v3 among Rust, Go, JavaScript, and Zig, or v2↔v2 among the remaining SDKs. For mixed deployments, both services must explicitly agree on the version/profile and any negotiated extensions.

### Does field order matter?

In **Dynamic Profile**, map keys are sent in the order the encoder emits them. There is no canonical ordering requirement for maps. Decoders must accept any key order.

In **Bound Profile**, field order is fixed by schema. A decoder relying on field position for a schema-aware message must use the schema-defined order.

### Can a v2 decoder decode v1 payloads?

No. v2 is a clean break. The tag-table wire model of v2 is incompatible with v1's message-kind envelope. If you need to support both, detect the version from a framing header or connection handshake and dispatch accordingly.

---

## Performance

### Is Twilic faster than JSON?

For encoding and decoding, binary formats are generally faster than text formats because they avoid UTF-8 parsing, number-to-string conversion, and escape handling. The JS SDK's N-API backend (native Rust) is typically 3–5× faster than `JSON.stringify`/`JSON.parse` for equivalent payloads.

However, for a single small object, the difference may be negligible compared to network latency. Twilic's performance advantage is most pronounced on **batch encoding/decoding** where per-record overhead dominates.

### Should I use row batch or column batch?

Use **row batch** when:

- Latency matters and batches are small (< 64 records)
- Columns are mixed types or have low regularity
- You want simpler encoder logic

Use **column batch** when:

- Throughput matters more than latency
- Batches are large (> 64 records)
- Columns are numeric and have high regularity (time series, metrics)
- You need maximum compression ratio

### How much memory does the encoder use?

The Dynamic encoder maintains message-local intern tables (key table, string table, shape table). Memory is proportional to the number of distinct keys, strings, and shapes in a single message — typically a few KB for realistic messages.

The `SessionEncoder` additionally maintains session state (base snapshots, templates). Memory depends on the size and number of registered state objects.
