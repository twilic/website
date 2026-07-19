# Comparison with Other Formats

Twilic is not a replacement for every format. This page gives an honest comparison so you can decide when Twilic is the right choice.

Try fixture payloads interactively in the [Playground](/guide/playground).

## Summary Table

| Feature | JSON | MessagePack | Protobuf | FlatBuffers | Twilic |
| --- | --- | --- | --- | --- | --- |
| Self-describing | ✓ | ✓ | ✗ | ✗ | ✓ |
| No schema required | ✓ | ✓ | ✗ | ✗ | ✓ |
| Schema accelerates it | ✗ | ✗ | ✓ | ✓ | ✓ |
| Key interning | ✗ | ✗ | n/a | n/a | ✓ |
| Shape interning | ✗ | ✗ | n/a | n/a | ✓ |
| Typed vector codecs | ✗ | ✗ | limited | limited | ✓ |
| Columnar batch | ✗ | ✗ | ✗ | ✗ | ✓ |
| Stateful patch | ✗ | ✗ | ✗ | ✗ | ✓ (optional) |
| Human readable | ✓ | ✗ | ✗ | ✗ | ✗ |
| Zero-copy decode | ✗ | ✗ | ✗ | ✓ | optional |

## Twilic vs JSON

### Where JSON wins

- **Human readability**: JSON is text and can be read, edited, and debugged without tools.
- **Universal support**: Every language, framework, and tool speaks JSON out of the box.
- **Simplicity**: One encoding rule, no schema, no configuration.

### Where Twilic wins

- **Size**: Twilic is smaller once structure repeats. On the pinned `batch-homogeneous-256` fixture, Twilic Dynamic is **81.2%** smaller than JSON and **72.7%** smaller than MessagePack ([Benchmark](/benchmark)).
- **Speed**: Binary parsing is faster than UTF-8 string tokenization on batch workloads; Twilic also skips repeated key parsing in shape mode.
- **Repetition**: JSON sends field names verbatim every time. Twilic sends each field name once per batch message.
- **Typed integers**: JSON represents large integers as text; Twilic encodes them as compact binary widths / `bigint` in JS.
- **Binary data**: JSON requires base64 encoding (~33% overhead); Twilic has native `bin` types.

### Migration path

Twilic's Dynamic Profile is intentionally MessagePack-compatible in data model: null, bool, int, float, string, binary, array, map. A JSON encoder can be replaced with Twilic's Dynamic encoder using the same logical value tree.

## Twilic vs MessagePack

MessagePack is Twilic's closest predecessor. Twilic is designed to be a strict improvement on MessagePack for workloads with repeated structure.

### Where MessagePack wins

- **Simplicity**: MessagePack has a minimal spec (~20 tag types) and is easy to implement from scratch.
- **Ecosystem**: MessagePack has mature libraries for virtually every language, including embedded and constrained environments.
- **One-shot payload size**: For a single, non-repeating map, MessagePack and Twilic Dynamic produce nearly identical output (Twilic adds no overhead on first occurrence).

### Where Twilic wins

| Scenario                         |     MessagePack |      Twilic Dynamic |
| -------------------------------- | --------------: | ------------------: |
| `single-small` (pinned)          |    140 B (100%) |        140 B (100%) |
| `batch-homogeneous-256` (pinned) | 19,505 B (100%) | **5,316 B (27.3%)** |
| `batch-mixed-256` (pinned)       | 20,893 B (100%) | **9,799 B (46.9%)** |

_Pinned from [Benchmark](/benchmark) (`@twilic/core` 3.1.0 N-API). Lower percentage is smaller._

The difference is structural: MessagePack repeats field names in every object; Twilic interns them within the batch.

### Key behavioral difference

MessagePack has no concept of message boundaries for reuse purposes. Every decode is stateless. Twilic formalizes this into the spec: intern tables are per-message, and stateful session state is explicit and optional.

## Twilic vs Protocol Buffers

Protocol Buffers (protobuf) is the dominant schema-first binary format. It achieves excellent compression by eliminating field names from the wire entirely.

### Where protobuf wins

- **Size on typed data**: Protobuf with a well-designed schema can be smaller than Twilic Dynamic for a single record because it omits all type tags and field names.
- **Generated code**: `protoc` generates fast, type-safe code. No manual value tree manipulation.
- **gRPC integration**: Protobuf is native to gRPC.
- **Maturity**: Protobuf has been production-hardened at Google scale for over 15 years.

### Where Twilic wins

- **Schema-less usability**: Twilic Dynamic needs no schema. Protobuf requires a `.proto` file and a code generation step.
- **Ad-hoc data**: Protobuf cannot natively encode a map with arbitrary string keys. Twilic handles it naturally.
- **Schema-aware batch**: Protobuf has no built-in columnar batch mode. Twilic `SCHEMA_BATCH` can outperform repeated protobuf messages on homogeneous repeated-record payloads where schema-derived bit packing or column codecs apply.
- **Stateful compression**: Protobuf has no state patch or session compression. Twilic's stateful profile can dramatically reduce payload on hot update streams.
- **Gradual adoption**: You can start with Twilic Dynamic (no schema) and migrate to Bound Profile (schema-aware) incrementally, without changing the API.

### Size comparison: `UserRecordV1` ×256 (pinned)

| Format                         |                Size |
| ------------------------------ | ------------------: |
| Twilic Dynamic (`encodeBatch`) | see Dynamic section |
| Protobuf stream (schema OOB)   |         3,458 bytes |
| Avro raw stream (schema OOB)   |         2,852 bytes |
| Twilic `BOUND_STREAM`          |     **2,395 bytes** |
| Twilic `SCHEMA_BATCH`          |       **798 bytes** |

For a **single record**, Protobuf and Twilic Bound are in the same ballpark. For **homogeneous batches**, Twilic `SCHEMA_BATCH` wins when columnar codecs compress repeated numeric or low-cardinality patterns that Protobuf treats as independent values. Full assumptions: [Benchmark](/benchmark).

## Twilic vs FlatBuffers / Cap'n Proto

Zero-copy formats (FlatBuffers, Cap'n Proto) are optimized for **decode latency**: a buffer can be memory-mapped and accessed without deserialization. Twilic's Bound Profile has an optional zero-copy layout extension.

### Where FlatBuffers wins

- **Zero-copy decode**: Fields are accessed by offset without parsing. Decode latency approaches zero.
- **Deterministic access time**: No allocation, no parse tree.

### Where Twilic wins

- **Dynamic mode**: FlatBuffers requires a schema for every message. Twilic Dynamic handles arbitrary data.
- **Wire size**: FlatBuffers has alignment padding overhead that Twilic avoids.
- **Batch compression**: FlatBuffers has no columnar or stateful modes.

## Decision Guide

```text
Do you need human readability?
  → Yes: use JSON
  → No: continue

Do you have a fixed schema and maximum decode speed?
  → Yes: consider FlatBuffers or Cap'n Proto

Do you need zero schema overhead and MessagePack-like simplicity?
  → No repeated structure: MessagePack is fine
  → Repeated structure / batches / streams: use Twilic

Do you want schema-aware compression for maximum density?
  → Yes: use Twilic Bound Profile (or Protobuf if gRPC is a hard requirement)

Do you have long-lived streams where most fields don't change?
  → Yes: use Twilic Stateful Profile
```

## Related

- [Migrating from Protobuf](/guide/articles/migrating-from-protobuf)
- [Migrating from MessagePack](/guide/articles/migrating-from-messagepack)
- [Encoder Selection](/guide/encoder-selection)
