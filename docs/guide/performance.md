# Performance

Twilic performance depends on profile choice, batch size, backend (N-API vs WASM), and payload shape — not on the format alone. Benchmark your production data before optimizing.

## Backend selection (JavaScript)

| Backend | Environment         | Throughput | Latency          |
| ------- | ------------------- | ---------- | ---------------- |
| N-API   | Node.js 24+         | Highest    | Lowest           |
| WASM    | Browser, edge, Deno | Good       | Higher init cost |

```ts
const kind = await init({ prefer: "napi" }); // or "wasm"
```

WASM requires one-time module load. Amortize across many encode/decode calls.

## Profile impact

| Profile        | Encode cost | Wire size               | Decode cost |
| -------------- | ----------- | ----------------------- | ----------- |
| Dynamic single | Low         | Baseline                | Low         |
| Batch 256      | Medium      | 30–70% smaller          | Medium      |
| Bound          | Low–medium  | Smallest single record  | Low         |
| Stateful patch | Low         | 70–90% smaller per tick | Low         |

**Highest ROI:** Batch on repeated structure, Stateful on stable streams.

## Batch size sweet spots

Measure on your hardware and payload:

```bash
git clone https://github.com/twilic/benchmark.git
cd benchmark
pnpm install
pnpm bench
```

| Workload              | Starting batch size |
| --------------------- | ------------------- |
| API list response     | 50 (page size)      |
| Telemetry flush       | 256                 |
| Cache snapshot        | 500–1000            |
| WebSocket micro-batch | 4–16                |

Increase batch size until marginal size reduction per added record drops below your latency budget.

## Transport-JSON fast path

For JavaScript, `@twilic/core/advanced` exposes transport-JSON encoding that skips some JS object traversal:

```ts
import { encodeTransportJson, toTransportJson } from "@twilic/core/advanced";

const json = toTransportJson(value);
const bytes = encodeTransportJson(json);
```

Useful when values are already serialized or in high-throughput pipelines. See [benchmark README](https://github.com/twilic/benchmark).

## N-API vs WASM benchmarks

Representative numbers from the [Benchmark](/benchmark) page (single 6-field object):

| Operation | Twilic (N-API) | MessagePack |
| --------- | -------------- | ----------- |
| Encode    | ~similar       | baseline    |
| Decode    | ~similar       | baseline    |

Gains come from **wire size reduction** (less I/O, less allocation) more than raw encode/decode microseconds on small objects.

## Columnar telemetry

256-event batch (6 fields):

| Format           | Size     |
| ---------------- | -------- |
| JSON             | ~98 KB   |
| MessagePack      | ~65 KB   |
| Twilic col_batch | ~8–12 KB |

At 10,000 events/sec, that is the difference between ~650 MB/s and ~80 MB/s on the wire.

## Rust / native SDKs

Rust, Go, and Python native implementations avoid JS/WASM overhead entirely. Use them on:

- High-throughput agents and forwarders
- Server-side batch encoding
- Edge workers where N-API is unavailable (use WASM or native port)

## Optimization checklist

1. [ ] Benchmark production-shaped payloads (not toy JSON)
2. [ ] Enable batch on list/bulk endpoints
3. [ ] Tune batch size against latency SLO
4. [ ] Use stateful patches on WebSocket products
5. [ ] Promote hot paths to Bound profile when schema is stable
6. [ ] Prefer N-API on Node.js servers
7. [ ] Bundle WASM efficiently in browser (single init, reuse encoder)

## Anti-patterns

| Pattern                             | Why it hurts                          |
| ----------------------------------- | ------------------------------------- |
| Batch size 1 on HTTP lists          | No compression benefit                |
| Stateful on HTTP                    | Session overhead, no reuse            |
| Re-encoding JSON → Twilic per field | Batch at record level                 |
| Ignoring bigint in JS               | Silent precision loss, re-encode bugs |

## Related

- [Benchmark](/benchmark)
- [Batch & Columnar](/guide/batch-and-columnar)
- [CLI bench command](/guide/cli#bench)
