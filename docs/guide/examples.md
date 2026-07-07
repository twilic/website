# Examples

The [Twilic Examples](https://github.com/twilic/examples) repository is a collection of runnable projects that show how Twilic works in real applications. Each example compares payload sizes against JSON and MessagePack where useful, and demonstrates a specific profile or encoding pattern.

Use these examples to evaluate Twilic before adopting it, or as starting points for your own integrations.

## Prerequisites

- Node.js 24+
- [pnpm](https://pnpm.io/) (recommended)

## Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/twilic/examples.git
cd examples
pnpm install
```

## Overview

| Example | Profile | Command |
| --- | --- | --- |
| [API response](#api-response) | Stateless Batch | `pnpm example:api-response` |
| [WebSocket session](#websocket-session) | Stateful | `pnpm example:websocket:simulate` |
| [Batch records](#batch-records) | Batch | `pnpm example:batch-records` |
| [Telemetry](#telemetry) | Batch (`col_batch`) | `pnpm example:telemetry` |
| [Logs](#logs) | Dynamic + Batch | `pnpm example:logs` |
| [Cache payload](#cache-payload) | Dynamic (stateless) | `pnpm example:cache-payload` |

## API Response

Return paginated user lists as compact Twilic batch payloads over HTTP.

**Profile:** Stateless Batch — `encodeBatch` with shape and string interning across same-shape records.

### Run

```bash
# terminal 1
pnpm example:api-response

# terminal 2
pnpm example:api-response:client
```

### Endpoints

| Route             | Format                                  |
| ----------------- | --------------------------------------- |
| `GET /users`      | Twilic batch (`application/vnd.twilic`) |
| `GET /users.json` | JSON (size comparison)                  |

### What it shows

50 user records with 8 fields each. Field names are sent once; repeated strings like `"admin"` and `"us-east"` are interned. The server prints a size table on startup; the client compares Twilic vs JSON byte counts.

The server uses [`@twilic/hono`](https://github.com/twilic/hono) for content negotiation and [`@twilic/fetch`](https://github.com/twilic/fetch) on the client.

### When this fits

- REST list endpoints with repeated object shapes
- Mobile or edge clients that fetch many pages
- APIs where bandwidth matters more than human-readable JSON

::: tip Use stateless Dynamic or Batch profiles for HTTP. Stateful session compression requires an ordered stream and is not used here. :::

See also: [Cookbook — API Response with Repeated Structure](/guide/cookbook#api-response-with-repeated-structure).

## WebSocket Session

Stream live dashboard metrics over WebSocket with stateful Twilic compression.

**Profile:** Stateful — `createSessionEncoder()` with `encode()` for the first frame and `encodePatch()` when only a few fields change.

### Run

Simulation (size comparison, recommended first):

```bash
pnpm example:websocket:simulate
```

Live WebSocket demo:

```bash
# terminal 1
pnpm example:websocket

# terminal 2
pnpm example:websocket:client
```

### What it shows

- **simulate.ts** — 20 ticks of dashboard metrics; compares JSON, full `encode()`, and `encodePatch()` sizes per tick
- **server.ts** — sends binary frames every second; first tick is full, later ticks use patches
- **client.ts** — logs frame sizes and decodes when possible

### When this fits

- Live dashboards and game state
- Ordered, reliable streams where most fields stay stable
- Scenarios where 2–3 of 15 fields change per update

### Session recovery

Call `session.reset()` after a disconnect so the next frame is a full stateless message, then resume patching.

::: info JS SDK note The current `@twilic/core` SDK exposes session **encode** APIs. Patch frame decoding on the client may require a matching session decoder in your language SDK. Use `simulate.ts` to evaluate payload savings; treat the WebSocket demo as a binary transport example. :::

See also: [Cookbook — WebSocket Streaming](/guide/cookbook#websocket-streaming-live-dashboard).

## Batch Records

Send many homogeneous records in one payload using Twilic batch encoding.

**Profile:** Batch — `encodeBatch` picks `row_batch` for smaller same-shape sets and `col_batch` for larger tabular data.

### Run

```bash
pnpm example:batch-records
```

### What it shows

1. **64 same-shape records** — row batch with shape interning
2. **256 telemetry-shaped records** — column batch with per-column codecs

Each scenario prints encoded sizes for JSON, MessagePack, and Twilic.

### When this fits

- Bulk exports and queue messages
- API endpoints that return many records at once
- Pipelines that flush records in groups instead of one-by-one

## Telemetry

Batch high-frequency telemetry events with column-oriented compression.

**Profile:** Batch — `col_batch` compresses each column independently (`DELTA_BITPACK`, `RLE`, etc.).

### Run

```bash
pnpm example:telemetry
```

### What it shows

Telemetry events with repeated `service` and `level` values, batched at 16, 64, and 256 records. The script prints JSON, MessagePack, and Twilic sizes for each batch size.

### When this fits

- Metrics and observability pipelines
- Time series with stable field shapes
- Throughput-optimized ingestion where larger batches are acceptable

### Batch size tuning

- **16–64 records** — lower latency per flush
- **256+ records** — better compression on numeric and enum-like columns

See also: [Cookbook — Telemetry Pipeline](/guide/cookbook#telemetry-pipeline).

## Logs

Structured log shipping with string and shape interning.

**Profile:** Dynamic + Batch — repeated `level`, `service`, and field names compress well when events are grouped.

### Run

```bash
pnpm example:logs
```

### What it shows

1,000 structured log events compared as:

- NDJSON (one JSON object per line)
- Twilic `encode` per event
- Twilic `encodeBatch` in 100-event flushes
- Twilic `encodeMicroBatch` in 50-event bursts

### When this fits

- Log agents that flush on an interval
- Bursty application logging
- Pipelines where the same strings appear across many events

### Trade-off

Per-event encoding is simple but repeats field names and common strings. Batching or micro-batching amortizes that overhead across each flush.

## Cache Payload

Store compact binary session blobs in a key-value cache.

**Profile:** Dynamic (stateless) — each value is encoded independently with `encode` and decoded with `decode`.

### Run

```bash
pnpm example:cache-payload
```

### What it shows

100 user session objects stored in an in-memory `Map<string, Uint8Array>`, with total size compared against JSON strings. A roundtrip decode verifies data integrity.

### When this fits

- Redis, Memcached, or CDN edge caches
- Session stores with stable object shapes
- Config snapshots that are read more often than they change

::: tip Use stateless encoding per cache key. Stateful session compression is for ordered streams, not unrelated KV entries. :::

## When Twilic Fits Well

Twilic is designed for data with repeated patterns. It can be a good fit when:

- Many messages share the same object shape
- The same strings appear repeatedly
- Records are sent in batches
- Only small changes need to be sent after the first message

These examples make the trade-offs visible so you can choose Twilic for the right use cases. Twilic is not intended to replace every serialization format in every situation.

## Related resources

| Resource | Description |
| --- | --- |
| [Cookbook](/guide/cookbook) | Practical patterns with code snippets across languages |
| [Playground](/guide/playground) | Interactive size comparison in the browser |
| [Benchmark](/benchmark) | Encode/decode throughput measurements |
| [@twilic/core](https://www.npmjs.com/package/@twilic/core) | JavaScript / TypeScript SDK used by all examples |

## Source

[github.com/twilic/examples](https://github.com/twilic/examples)
