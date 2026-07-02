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

- **Size**: Twilic is consistently smaller. On a realistic 6-field object, Twilic encodes in 30–50% fewer bytes than JSON.
- **Speed**: Binary parsing is faster than UTF-8 string tokenization. Twilic also skips key parsing entirely in shape mode.
- **Repetition**: JSON sends field names verbatim every time. Twilic sends each field name once.
- **Typed integers**: JSON represents `9007199254740993` as a 16-character string; Twilic encodes it in 8 bytes as `u64`.
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

| Scenario | MessagePack | Twilic |
| --- | --- | --- |
| Single record | ~100% | ~100% (same) |
| 10 records, same shape | 100% | ~60–70% |
| 100 records, same shape | 100% | ~30–40% |
| 1,000 records, same shape | 100% | ~20–30% |
| Homogeneous int array (1k elements) | 100% | ~15–25% (with delta bitpack) |
| Stateful stream (2/20 fields change) | 100% | ~10–15% (with state patch) |

_Percentages relative to MessagePack size. Lower is smaller._

The difference is purely structural: MessagePack repeats field names in every object; Twilic interns them.

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
- **Columnar batch**: Protobuf has no built-in batch or columnar mode. Twilic's `col_batch` with per-column codecs outperforms repeated protobuf messages on large tabular datasets.
- **Stateful compression**: Protobuf has no state patch or session compression. Twilic's stateful profile can dramatically reduce payload on hot update streams.
- **Gradual adoption**: You can start with Twilic Dynamic (no schema) and migrate to Bound Profile (schema-aware) incrementally, without changing the API.

### Size comparison: single 6-field record

| Format                     | Size (approx.) |
| -------------------------- | -------------- |
| JSON                       | 120 bytes      |
| MessagePack                | 80 bytes       |
| Twilic Dynamic             | 75 bytes       |
| Protobuf (with schema)     | 45 bytes       |
| Twilic Bound (with schema) | 40–50 bytes    |

For a **single record**, protobuf and Twilic Bound are comparable. For **batches**, Twilic's columnar mode often wins because per-column codecs compress repeated numeric patterns that protobuf treats as independent values.

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
