# Telemetry and Event Pipelines at Scale

High-volume telemetry is where compact binary formats earn their place. Agents on every host, forwarders between tiers, and consumers writing to Kafka or object storage all pay per byte and per parse.

Fluent Bit uses MessagePack as its **internal data representation** because text JSON cannot keep up with log and metric volume. Fluentd's forward protocol treats MessagePack-based transport as the most efficient path between nodes. The pattern is consistent: **same-shaped records, extreme frequency, humans never read the wire format**.

Twilic is designed for exactly this repetition profile — and goes materially smaller than MessagePack when events are batched.

## The Cost of "Small" Events at Scale

A single observability event looks harmless:

```json
{
  "timestamp": 1700000000100,
  "service": "api-gateway",
  "level": "info",
  "trace_id": "a1b2c3d4",
  "duration_ms": 12,
  "message": "request completed"
}
```

At 10,000 events per second per service, the overhead compounds:

| Cost dimension | What grows                      |
| -------------- | ------------------------------- |
| Agent CPU      | UTF-8 parse, map allocation, GC |
| Host egress    | Bytes × nodes × regions         |
| Queue storage  | Retention days × daily ingest   |
| Consumer lag   | Deserialize throughput ceiling  |

Field names like `"timestamp"` and `"duration_ms"` are identical on every event. JSON repeats them verbatim. MessagePack compacts values but **still repeats keys in every map**.

## Why Teams Chose MessagePack Here

MessagePack adoptions in observability pipelines prioritize:

- **Streaming APIs** — incremental decode from sockets and pipes
- **No schema upfront** — new fields appear as services evolve
- **Cross-language agents** — collectors in C/Rust, processors in Go/Python/Node
- **Smaller than JSON** — without Protobuf's contract ceremony

That is the right baseline. Twilic adds a batch and columnar layer on top for aggregation stages.

## Twilic's Advantage: Columnar Batch

When events are grouped — flusher batches, Kafka micro-batches, aggregator windows — Twilic's `col_batch` treats each field as a column:

| Column        | Typical codec          | Why it works            |
| ------------- | ---------------------- | ----------------------- |
| `timestamp`   | Delta bitpack          | Monotonic, small deltas |
| `service`     | String dictionary      | Low cardinality         |
| `level`       | RLE                    | Long runs of `"info"`   |
| `duration_ms` | FOR bitpack / Simple8b | Numeric cluster         |
| `trace_id`    | String list            | Dedup within batch      |

**Size comparison** (256 events, 6 fields — see [Cookbook](/guide/cookbook#telemetry-pipeline)):

| Format             | Approximate size |
| ------------------ | ---------------- |
| JSON               | ~98 KB           |
| MessagePack        | ~65 KB           |
| Twilic `col_batch` | ~8–12 KB         |

That is not a marginal improvement — it changes how many days you retain, how many aggregator replicas you need, and how close you run to egress limits.

## Architecture Patterns

### Edge agent → forwarder

Agents collect events and batch locally (16–64 records for latency-sensitive paths, 256–1024 for throughput).

```text
[Host agent]  --Twilic batch-->  [Regional forwarder]  --Twilic batch-->  [Kafka / S3 / OLAP]
```

Use Dynamic for single-event debug paths; `col_batch` for bulk flush.

### Kafka consumer groups

Consumers deserialize Twilic batches, process columns vectorized where possible, and ack. Smaller messages improve consumer throughput and reduce rebalance pain.

### Log replay and cold storage

Archive Twilic batches to object storage. Columnar layout often compresses further with ZSTD/LZ4 on top — smaller objects, lower storage class bills.

## Operational Considerations

### Batch size tuning

| Goal                                  | Batch size      |
| ------------------------------------- | --------------- |
| Low flush latency                     | 16–64 events    |
| Maximum compression                   | 256–1024 events |
| Time series with many numeric columns | Larger batches  |

### Observability of the observability stack

Binary wire formats are not human-readable. Plan a **two-layer design**:

- **Wire**: Twilic (or MessagePack) between machines
- **Debug**: JSON summary lines or structured logs at sampling boundaries for incidents

Do not route attacker-controlled binary payloads through "convert to JSON for debugging" pipelines without hardening — treat decode as a security boundary.

### Schema evolution

Like MessagePack, Twilic does not replace your compatibility policy. Document:

- How new fields are introduced (additive only)
- Whether consumers ignore unknown keys
- How batch column order is determined (field order in first row)

String keys and explicit version bytes remain the safest long-term strategy.

## Pilot Checklist

1. Sample 1 hour of production events — same shape distribution as steady state
2. Run [Examples — Telemetry](https://github.com/twilic/examples) or encode with your SDK
3. Compare size vs JSON and MessagePack at batch sizes 64, 256, 1024
4. Measure decode throughput on consumer hardware
5. Roll out on one agent → one forwarder hop with fallback to MessagePack
6. Watch consumer lag, agent CPU, and egress billing for two weeks

## When MessagePack Is Enough

If your pipeline processes **mostly single events** with no batching stage, or batch sizes stay under ~10, Twilic's columnar win shrinks. MessagePack remains a solid choice for simple forward paths.

## Next Steps

- [Cookbook — Telemetry Pipeline](/guide/cookbook#telemetry-pipeline)
- [Examples — Telemetry](https://github.com/twilic/examples)
- [Examples — Logs](https://github.com/twilic/examples)
- [Enterprise Use Cases — Telemetry](/guide/enterprise-use-cases#telemetry-and-event-pipelines)
