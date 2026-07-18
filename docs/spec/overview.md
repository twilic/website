# Specification Overview

This page summarizes the Twilic v3 specification. For normative detail, read the full spec in the [twilic repository](https://github.com/twilic/twilic/blob/main/SPEC.md) or the [v3 reference profile](/spec/v3).

## Purpose

Twilic v3 is a compact binary format that keeps MessagePack-like usability while adding schema-bound and batch payloads designed to be competitive with Protocol Buffers and Avro on explicitly benchmarked schema-fixed workloads.

The v3 benchmark targets are scoped:

- Dynamic targets smaller output than MessagePack and CBOR on repeated keys, repeated strings, homogeneous arrays, and same-shape object arrays.
- Bound targets comparable output to Protobuf and Avro on streams of schema-fixed records.
- Batch targets smaller output on homogeneous repeated-record payloads where columnar codecs apply.

## Design Principles

| Principle | Summary |
| --- | --- |
| API family | Dynamic, schema, stream, batch, and session APIs can coexist without forcing one transport model. |
| Deferred optimization | Start self-describing, then use compact forms when repetition or schema context exists. |
| Minimal one-shot cost | Tiny non-repeating values should not pay unrelated control overhead. |
| Repetition wins | Message-local reuse, typed vectors, Bound streams, schema batches, and stateful extensions target repeated data. |
| Deterministic wire behavior | A fixed profile and resolved schema must produce deterministic bytes. |
| Native fast paths | Implementations should encode/decode runtime values without mandatory JSON text serialization. |

## Profiles

Twilic v3 defines three primary data profiles and one optional stateful profile.

| Profile | Description |
| --- | --- |
| **Dynamic** | MessagePack-like, schema-less, and v2-compatible where tags are unchanged. Uses message-local `key_ref`, `str_ref`, `shape_def`, and `shape_ref`. |
| **Bound** | Shared-schema profile. Field names, field numbers, type tags, and per-field fallback mode bytes are omitted from compact field payloads. `BOUND_STREAM` binds one schema for consecutive compact record bodies. |
| **Batch** | Row-wise, columnar, and schema-aware columnar batches. `SCHEMA_BATCH` is the shared-schema columnar form. |
| **Stateful** | Optional negotiated extensions for patches, templates, dictionaries, and persistent table state. The v3 reference interoperability profile is stateless unless a stateful profile is negotiated. |

## v3 vs v2

v3 is a clean break from v2 for Bound Profile field/record-body payloads. Dynamic Profile may remain v2-compatible where tags are unchanged.

Key v3 changes:

- `BOUND_STREAM (0x0F)` for schema-bound compact record streams.
- `SCHEMA_BATCH (0x0E)` for schema-aware columnar batches.
- Bound field payloads prohibit fallback dynamic/literal encodings and per-field mode bytes in the compact layout.
- `min`/`max` are validation constraints; physical integer encoding is resolved by schema/profile.
- Compact record bodies separate presence bits, fixed bit groups, and byte payloads.
- v3 reference profile fixes defaults for schema id, count, column count, field id omission, and `layout_kind = compact`.
- Benchmark byte accounting distinguishes message bytes, raw record-body bytes, raw column payload bytes, external framing, and compression/dictionary overhead.

## Read Order

1. [Wire Tags](/spec/wire-tags) — Dynamic tags and Bound/Batch envelope kinds.
2. [Profiles](/spec/profiles) — Dynamic, Bound, Batch, and Stateful behavior.
3. [Format Guide](/spec/format) — byte-level structure and decode shape.
4. [Encoding Guide](/spec/encoding) — scalar rules, interning, vector codecs, and Bound payloads.
5. [Transport Guide](/spec/transport) — stateless/stateful assumptions and versioning.
6. [v3 Reference Profile](/spec/v3) — current interoperability profile.
