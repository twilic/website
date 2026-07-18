# Batch & Columnar Encoding

Batch encoding is where Twilic's advantage over repeated structure is largest. This guide explains dynamic row batches, dynamic columnar batches, v3 `SCHEMA_BATCH`, batch sizing, and when each mode applies.

## Row batch vs columnar batch

| Mode | Wire tag | Best for |
| --- | --- | --- |
| **Row batch** | `row_batch` | Nested objects, moderate field count, general API lists |
| **Columnar batch** | `col_batch` | Tabular data, many rows, numeric/time-series columns |
| **Schema batch** | `SCHEMA_BATCH` (`0x0E`) | Shared-schema tabular records and Protobuf/Avro comparisons |

Dynamic row/column batches share shape and string interning. Columnar mode additionally compresses each field as an independent column. `SCHEMA_BATCH` uses a shared schema, schema-order columns, presence bitmaps, and typed-vector payloads.

## Row batch

```ts
import { encodeBatch } from "@twilic/core/advanced";

const users = page.map((u) => ({
  id: BigInt(u.id),
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
}));

const bytes = encodeBatch(users);
```

**What happens on the wire:**

1. Shape definition: field names registered once
2. Each row encoded with shape reference (no repeated keys)
3. Repeated strings (`"admin"`, `"us-east"`) interned across rows

## Columnar batch

Ideal for telemetry, logs, and analytics events.

```ts
const events = [
  { timestamp: 1700000000100n, service: "api", level: "info", duration_ms: 12 },
  { timestamp: 1700000000200n, service: "api", level: "info", duration_ms: 9 },
  // ... up to 256+ events
];

const bytes = encodeBatch(events);
// Encoder selects col_batch when column regularity is high
```

Per-column codec selection:

| Column type | Typical codec | Example |
| --- | --- | --- |
| Monotonic timestamp | `DELTA_BITPACK` | Log event times |
| Low-cardinality string | Dictionary | `service`, `level` |
| Repeated value runs | `RLE` | Log levels (`info`, `info`, `info`, …) |
| Numeric cluster | `FOR_BITPACK`, `SIMPLE8B` | `duration_ms`, sensor readings |
| Homogeneous float array | `XOR_FLOAT` | Temperature samples |

The v3 reference interoperability profile defines payload grammar for `PLAIN` and `DIRECT_BITPACK`. Other registered codec codes require a negotiated codec profile before interoperable results or benchmark claims use them.

## Schema batch

Use `SCHEMA_BATCH` when every row is represented by one shared schema:

```text
0x0E [schema_id?][count][column_count?][columns...]
```

In the v3 reference profile, `column_count` is present and `field_id` is omitted in strict schema-order compact mode. Optional/nullable columns use row-order presence bitmaps, and typed-vector payloads encode present values only.

## Size comparison (256 events, 6 fields)

| Format             | Size      |
| ------------------ | --------- |
| JSON               | ~98 KB    |
| MessagePack        | ~65 KB    |
| Twilic row batch   | ~25–35 KB |
| Twilic `col_batch` | ~8–12 KB  |

For schema-fixed homogeneous records, compare `SCHEMA_BATCH` against Protobuf repeated messages or Avro raw streams using equivalent schema and framing assumptions.

## Batch size tuning

| Priority        | Batch size       | Trade-off                   |
| --------------- | ---------------- | --------------------------- |
| Low latency     | 16–64 records    | Smaller compression win     |
| Balanced        | 128–256 records  | Good default for APIs       |
| Max compression | 512–1024 records | Higher flush latency        |
| Time series     | 256–1024+        | Columnar codecs need volume |

**Rule of thumb:** batch until compression gain plateaus on your payload — then measure P99 flush latency.

## HTTP list endpoints

```ts
import { encodeBatch } from "@twilic/core/advanced";
import { twilicResponse } from "@twilic/hono";

app.get("/users", async (c) => {
  const users = await db.getUsers({ page, limit: 50 });
  const bytes = encodeBatch(users);
  return new Response(bytes, {
    headers: { "Content-Type": "application/vnd.twilic" },
  });
});
```

Or use a custom codec with `createTwilicHono` — see [Hono integration](/integrations/hono).

## Pipeline batching

```text
[Agent: batch 64] → [Forwarder: batch 256] → [Kafka] → [Consumer]
```

Re-batch at each tier for cumulative compression. Do not re-encode individual events mid-pipeline unless necessary.

## Anti-patterns

| Pattern | Problem |
| --- | --- |
| Batch size = 1 | No interning benefit |
| Mixed shapes in one batch | Shape table churn, poor compression |
| Batch on HTTP error responses | Overhead exceeds benefit for tiny payloads |
| Columnar on deeply nested objects | Row batch is better |

## Language examples

### Rust

```rust
let bytes = twilic::encode_batch(&records)?;
```

### Python

```python
payload = twilic.encode_batch(events)
```

### Go

```go
bytes, err := twilic.EncodeBatch(records)
```

## Related

- [Cookbook — Telemetry](/guide/cookbook#telemetry-pipeline)
- [Telemetry at Scale article](/guide/articles/telemetry-and-event-pipelines-at-scale)
- [Spec — Format Guide](/spec/format)
