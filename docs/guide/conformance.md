# Conformance & Testing

Twilic conformance means any conforming encoder output decodes correctly on any conforming decoder for the same explicitly selected version and profile. The current specification family is [v3](/spec/v3). Rust, Go, JavaScript, and Zig are on the v3 interop line; other published SDKs remain on v2 until their v3 support lands. This guide explains how conformance is defined, tested, and validated in your own pipeline.

## Conformance definition

An implementation is **v3-interoperable** when it ([Spec §v3](/spec/v3)):

1. Encodes Dynamic Profile values deterministically where v3 defines canonical behavior
2. Resets message-local `key_id`, `str_id`, and `shape_id` tables at each top-level message boundary
3. Fails decode on unknown `key_ref`, `str_ref`, or `shape_ref` IDs
4. Implements compact Bound payloads without per-field fallback mode bytes
5. Implements `BOUND_STREAM` and `SCHEMA_BATCH` with the declared schema/framing defaults for its profile
6. Supports reference-profile `PLAIN` and `DIRECT_BITPACK` payload grammars
7. Rejects unnegotiated stateful forms and unnegotiated extension codecs

The remaining published SDKs are **v2-interoperable** when they ([Spec §v2](/spec/v2#interoperability)):

1. Encodes all Dynamic Profile values deterministically
2. Decodes Dynamic, Batch, and stateless Bound messages correctly
3. Resets intern tables at each top-level message boundary
4. Fails decode on unknown `key_ref`, `str_ref`, or `shape_ref` IDs
5. Supports all required column codecs
6. Honors `RESET_STATE`

Stateful forms (`STATE_PATCH`, `TEMPLATE_BATCH`, trained dictionary) require a negotiated stateful profile in v3. Decoders that do not implement a stateful profile must still decode stateless messages and reject stateful frames with a clear error.

## Required vs optional features

| Feature | Required | Tags / APIs |
| --- | --- | --- |
| Dynamic encode/decode | ✓ | `encode()`, `decode()` |
| Key/string/shape interning | ✓ | `0xD6`–`0xD9` |
| Typed vectors | ✓ | `0xDA` |
| Row batch | ✓ | `0xDB` |
| Column batch | ✓ | `0xDC` |
| Reference column codecs | ✓ | PLAIN, DIRECT_BITPACK |
| Extension column codecs | Negotiated | DELTA_BITPACK, FOR_BITPACK, RLE, SIMPLE8B, XOR_FLOAT, dictionary codecs |
| `BOUND_STREAM` | v3 required | `0x0F` |
| `SCHEMA_BATCH` | v3 required | `0x0E` |
| Stateful patch | Optional | `0xDD` |
| Template batch | Optional | `0xDE` |
| Trained dictionary | Optional | control stream + `dict_id` |
| Zero-copy layout (§6.4) | Not implemented | — |
| Static dictionary (§10.7) | Not implemented | — |

## Cross-language fixtures

The Twilic monorepo maintains shared interop fixtures. Each SDK runs encode/decode roundtrips against common payloads:

```bash
# Rust (reference implementation)
cd twilic-rust && cargo test

# Python
cd twilic-python && ./scripts/check-interop.sh

# Go
cd twilic-go && go test ./...

# JavaScript
cd twilic-js && pnpm test

# C
cd twilic-c && ./scripts/check-interop.sh
```

Fixtures cover Dynamic maps, batches, Bound schema objects, stateful patches, and trained dictionary transport.

## Spec test traceability

The reference Rust test suite maps spec sections to tests in `twilic-rust/docs/SPEC-TEST-TRACEABILITY.md`:

| Spec section | Coverage |
| --- | --- |
| §5 Dynamic Profile | Key table, shape table, typed vector threshold |
| §6 Bound Profile | Schema required fields, schema_id emission |
| §8 Numeric Encoding | Bitpack, delta, FOR, Simple8b, XOR float |
| §10 Strings | Literal, ref, prefix-delta, reset |
| §13 Batch/Stateful | Row/column threshold, patches, templates, dictionaries |
| §15 Dictionary transport | Profile hash validation, fresh decoder sync |
| §18 Encoder rules | Patch threshold, codec selection determinism |

Use this file when auditing SDK completeness.

## Determinism tests

Conforming encoders must produce deterministic bytes for identical input under the same version, profile, resolved schema, and negotiated options:

- Key ID assignment: first-seen order within message
- String ID assignment: first-seen order within message
- Shape ID assignment: first-seen at `shape_def`
- Codec selection: deterministic for equal statistics and equal codec profile

Run benchmark fixtures to verify cross-SDK size parity:

```bash
cd benchmark && pnpm bench -- --twilic-vs-msgpack-only
```

Encoded byte counts should match across SDKs for the same fixture (modulo optional features disabled).

## CI integration for your project

### Minimal conformance check

Add a smoke test that roundtrips your production payload shapes:

```ts
import { decode, encode } from "@twilic/core";
import { assert } from "node:assert/strict";

const fixtures = [userRecord, orderPage, logEvent];

for (const value of fixtures) {
  const bytes = encode(value);
  const roundtrip = decode(bytes);
  assert.deepEqual(roundtrip, value);
}
```

### Cross-language check

1. Export fixture JSON from your service
2. Encode in producer language, write bytes to file
3. Decode in consumer language, assert semantic equality
4. Run in CI on every SDK upgrade

### Stateful conformance

If using patches:

```bash
pnpm example:websocket:simulate  # size validation
# Add integration test: 20 ticks, disconnect, reconnect, verify recovery
```

## Unknown reference policy

Conformance requires explicit policy — not silent corruption:

| Policy           | Conformant behavior                  |
| ---------------- | ------------------------------------ |
| `failFast`       | Decode error with `UnknownReference` |
| `statelessRetry` | Error kind `StatelessRetryRequired`  |

Both producer and consumer must agree. Test both paths in integration tests.

## Validating a new SDK port

Checklist for language port authors:

- [ ] Dynamic map/array/scalar roundtrip
- [ ] Key ref after second key literal occurrence
- [ ] Shape registration after second identical key sequence
- [ ] Typed vector for homogeneous array ≥ 4 elements
- [ ] Row batch and column batch decode
- [ ] All required column codecs roundtrip
- [ ] Unknown ref ID fails decode (not silent garbage)
- [ ] `RESET_STATE` clears session tables
- [ ] Interop fixtures pass against Rust-generated bytes
- [ ] Deterministic encode: same input → same bytes

Reference port order: twilic-rust → twilic-go internal/core → other SDKs.

## CLI validation

Use Twilic CLI for ad-hoc wire inspection:

```bash
twilic decode payload.twl
twilic decode payload.twl --transport-json
twilic bench -- --mode full
```

See [CLI reference](/guide/cli).

## Reporting conformance gaps

If an SDK fails a fixture that Rust passes:

1. Identify spec section from [SPEC-TEST-TRACEABILITY](https://github.com/twilic/twilic-rust/blob/main/docs/SPEC-TEST-TRACEABILITY.md)
2. File issue on the SDK repository with fixture bytes attached
3. Reference the spec section number

## Related

- [Interop guide](/guide/interop)
- [v3 Reference Profile](/spec/v3)
- [v2 Legacy Reference Profile](/spec/v2)
- [Encoder Selection](/guide/encoder-selection)
- [Troubleshooting](/guide/troubleshooting)
- [Benchmark Fixtures](/benchmark/fixtures)
