# Why Twilic?

## The Problem with Existing Formats

### JSON

JSON is human-readable, universally supported, and easy to debug. But it has well-known costs:

- Field names are repeated verbatim in every object, even when the schema is fixed.
- No native binary type — binary data requires base64 encoding.
- No compact integer encoding — `1000000` costs 7 bytes as text.
- No mechanism for structural reuse across a stream of similar records.

### MessagePack

MessagePack addresses the encoding inefficiency of JSON without changing the data model: binary types, compact integer widths, and smaller overall payload size. It is a good default binary format.

But MessagePack still sends field names in every map, has no native shape-interning, and provides no batch or columnar modes. On workloads where the same object shape appears hundreds or thousands of times — telemetry, logs, API responses, database rows — the key overhead dominates.

### Protocol Buffers / FlatBuffers / Cap'n Proto

Schema-first formats achieve the smallest possible payloads by agreeing on field positions and types ahead of time. But they require a shared schema and a code generation step. They cannot encode ad-hoc or schema-less data without workarounds, and they cannot gracefully degrade to a self-describing form when no schema is available.

## What Twilic Does Differently

Twilic occupies the middle ground: **schema-less usability with progressive schema-aware compression**.

| Scenario | JSON | MessagePack | Twilic |
| --- | --- | --- | --- |
| One-shot ad-hoc value | ✓ verbose | ✓ compact | ✓ compact |
| Repeated object shape | ✗ key overhead | ✗ key overhead | ✓ shape interning |
| Repeated field names | ✗ verbose | ✗ verbose | ✓ key interning |
| Repeated string values | ✗ verbose | ✗ verbose | ✓ string interning |
| Homogeneous int arrays | ✗ text ints | ○ fixed-width | ✓ bitpack/delta/RLE |
| Tabular batch | ✗ | ✗ | ✓ columnar batch |
| Stateful stream | ✗ | ✗ | ✓ state patch |
| No schema needed | ✓ | ✓ | ✓ |
| Schema speeds it up | ✗ | ✗ | ✓ |

## When to Use Twilic

Twilic has a strong advantage when:

- **Objects with the same shape appear repeatedly** — API response lists, telemetry events, log records, database rows.
- **Field names are long or numerous** — REST APIs with verbose naming conventions.
- **String values repeat** — status fields, enum-like categories, user IDs in a session.
- **Numeric arrays are dense** — time series, sensor data, coordinates.
- **Batching is available** — sending multiple records together instead of one at a time.
- **A long-lived stream exists** — WebSocket connections, gRPC streams, message queue consumers.

Twilic's advantage over MessagePack shrinks on one-shot, non-repeating payloads. For those use cases, MessagePack or even JSON may be adequate.

## Comparison with Benchmarks

The [Benchmark](/benchmark) page shows throughput and payload size measurements for Twilic v2 vs. MessagePack and JSON on representative workloads. In general:

- Single-record encoding: Twilic ≈ MessagePack (within encoder overhead).
- 256-record batch: Twilic is measurably smaller due to shape and key interning.
- Columnar batch on typed data: Twilic is significantly smaller due to per-column codecs.
- Stateful patch on hot object streams: Twilic can send only changed fields.
