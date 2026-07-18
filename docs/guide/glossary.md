# Glossary

Terms used across Twilic documentation, specification, and SDK APIs.

## A–C

**Base snapshot**  
A full encoded message stored in session state as the reference point for subsequent patches. Identified by `base_id`.

**Batch profile**  
Encoding mode that groups multiple same-shape records into one message with shared shape and string tables.

**Bound profile**  
Schema-aware encoding mode. In v3 compact layouts, field names, field numbers, type tags, and per-field fallback mode bytes are omitted from field payloads; positions are defined by a [Schema](/reference/value-and-schema).

**BOUND_STREAM**: v3 envelope kind `0x0F` that binds one schema for consecutive compact record bodies.

**col_batch**  
Columnar batch message kind. Each field encoded as an independent column with per-column codec.

**Columnar batch**  
See [Batch & Columnar](/guide/batch-and-columnar).

**Control message**  
Session-level instruction (register keys, reset state, register shape) sent on stateful channels.

## D–I

**Dynamic profile**  
Default schema-less encoding. Self-describing values; no cross-message state.

**Extension (ext)**  
Application-defined binary payload with type code. Similar to MessagePack ext types.

**Interning**  
Sending a value (shape, key name, or string) once per message and referencing by ID thereafter.

**Key interning**  
Field names sent once in a shape definition, referenced by shape ID in subsequent objects.

## M–P

**Message**  
Low-level wire-level unit (scalar, batch, patch, control, etc.). See [Spec — Format](/spec/format).

**MessagePack**  
Binary JSON-like format. Twilic's closest predecessor for schema-less use cases.

**Patch / state patch**  
Stateful message sending only changed fields relative to a base snapshot or previous message.

**Profile**  
Encoding strategy: Dynamic, Batch, Bound, or Stateful. See [Encoding Profiles](/guide/encoding-profiles).

**Protobuf**  
Google's schema-first binary format. Strong alternative for gRPC and strict contracts.

## R–S

**Reference profile**  
Normative current encoding rules. See [v3 Reference Profile](/spec/v3).

**Row batch**  
Batch mode encoding records row-by-row with shared shape. Wire kind: `row_batch`.

**Schema**  
Field definition for Bound profile: field numbers, names, types, constraints.

**SCHEMA_BATCH**: v3 envelope kind `0x0E` for schema-aware columnar batches.

**Session encoder**  
Encoder maintaining state across an ordered message sequence for patches and dictionaries.

**Shape**  
Ordered set of field names defining an object structure. Registered once and referenced by `shape_id`.

**Shape interning**  
Sending shape definition once per batch; objects reference shape by ID.

**Stateful profile**  
Encoding mode using session state for patches, trained dictionaries, and template batches.

**String interning**  
Repeated string values sent once per message; subsequent occurrences use string ID.

## T–Z

**Template batch**  
Batch reusing a previously registered column template. Efficient when column structure repeats.

**Trained dictionary**  
Session-scoped string dictionary learned across messages for repeated values.

**Transport JSON**  
Intermediate JSON representation preserving Twilic types (`bigint`, `Uint8Array`). Used by JS advanced API.

**TwilicValue**  
Dynamic value type: null, bool, number, bigint, string, binary, array, map.

**Typed vector**  
Homogeneous array encoded with a specialized codec (delta bitpack, XOR float, RLE).

**UnknownReferencePolicy**  
Behavior when decoder sees unknown base/shape/dictionary ID: `failFast` or `statelessRetry`.

**v2**  
Current Twilic release line. Clean break from v1.

**Wire tag**  
First byte(s) identifying value type and encoding family. See [Wire Tags](/spec/wire-tags).

## Related

- [Core Concepts](/guide/concepts)
- [Specification Overview](/spec/overview)
