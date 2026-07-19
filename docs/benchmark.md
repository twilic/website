# Benchmark

This page publishes **pinned** size results from the Twilic benchmark harness (`twilic/benchmark`) and explains how to regenerate them. Measurements use `@twilic/core` **3.1.0** on Node.js 24 with the **N-API** backend. v3 schema-aware comparisons follow the [v3 benchmark contract](/spec/v3#1813-benchmark-contract).

Machine-local timing varies; **byte counts are deterministic** for these fixtures and are the numbers used in [Why Twilic](/guide/why) and [Comparison](/guide/comparison).

For interactive size comparisons in the browser, see the [Playground](/guide/playground). For fixture definitions, see [Benchmark Fixtures](/benchmark/fixtures). Raw JSON: [`/benchmark-snapshot.json`](/benchmark-snapshot.json).

## Setup

```bash
git clone https://github.com/twilic/benchmark
cd benchmark
pnpm install
pnpm --dir ../twilic-js build   # if local @twilic/core artifacts are stale
pnpm bench -- --backend napi --time-ms 1500 --warmup-ms 500 --json-out results/pinned-snapshot.json
```

Options:

```bash
pnpm bench -- --backend napi         # Node.js N-API (default)
pnpm bench -- --backend wasm         # WebAssembly
pnpm bench -- --mode max             # maximum benchmark suite
pnpm bench -- --twilic-vs-msgpack-only  # hide JSON rows
pnpm bench -- --time-ms 3000 --warmup-ms 1000  # longer windows
```

## What Is Measured

| Benchmark | Description |
| --- | --- |
| Dynamic sizes | `encode` / `encodeBatch` vs MessagePack, CBOR, BSON, JSON |
| Bound stream | `encodeBoundStream` (`BOUND_STREAM`, `0x0F`) vs Protobuf/Avro raw streams |
| Schema batch | `encodeBatchWithSchema` (`SCHEMA_BATCH`, `0x0E`) vs the same Protobuf/Avro streams |
| Throughput | encode/decode ops/s via `tinybench` (hardware-dependent) |

## Dynamic vs MessagePack (pinned)

Fixture set: `single-small`, `batch-homogeneous-256`, `batch-mixed-256`. No generic compression.

| Payload | Twilic | MessagePack | CBOR | JSON | vs MessagePack | vs JSON |
| --- | --: | --: | --: | --: | --: | --: |
| `single-small` | 140 | 140 | 144 | 180 | 0.0% | 22.2% |
| `batch-homogeneous-256` | **5,316** | 19,505 | 20,633 | 28,202 | **72.7%** | **81.2%** |
| `batch-mixed-256` | 9,799 | 20,893 | 22,204 | 29,659 | 53.1% | 67.0% |

On one-shot values Twilic Dynamic matches MessagePack. On a homogeneous 256-record batch, key/shape interning cuts MessagePack size by about **73%**.

## Bound / Batch vs Protobuf / Avro (pinned)

Fixture: `UserRecordV1` ×256 (`schema-example.json` style). **Schema shared out of band.**

| Format | Bytes | Notes |
| --- | --: | --- |
| Twilic `BOUND_STREAM` | **2,395** | compact schema-bound record stream |
| Twilic `SCHEMA_BATCH` | **798** | schema-order columnar batch |
| Protobuf stream | 3,458 | concatenated messages, no length prefixes |
| Avro raw stream | 2,852 | no OCF header |

| Twilic mode    |       vs Protobuf |           vs Avro |
| -------------- | ----------------: | ----------------: |
| `BOUND_STREAM` | **30.7%** smaller | **16.0%** smaller |
| `SCHEMA_BATCH` | **76.9%** smaller | **72.0%** smaller |

Assumptions match §18.13: schema id / field layout are not re-sent inside the Protobuf/Avro streams; Twilic still carries an in-band schema id and framing for the chosen message kind.

## Throughput (same pinned run)

Hardware-dependent; regenerate locally for CI claims. From the pinned N-API run:

| Operation               |          Twilic |     MessagePack |
| ----------------------- | --------------: | --------------: |
| Single encode           |     ~440k ops/s |     ~519k ops/s |
| Single decode           |     ~249k ops/s |     ~687k ops/s |
| 256-record batch encode | ~9.6k batches/s | ~6.1k batches/s |

Batch encode favors Twilic once interning amortizes; single-record decode still trails MessagePack on this path.

## Max Speed Tips

- Use `--backend napi` on Node.js (highest throughput)
- Use Node.js 24+ (project baseline)
- Increase run windows for stability: `--time-ms 3000 --warmup-ms 1000`
- Prefer `SCHEMA_BATCH` for shared-schema tabular datasets; use dynamic `encodeBatch` when no schema is available

## State Patch Performance

On a hot object stream where a few fields change per tick, `encodePatch` sends only the delta after the first full frame. See the playground **Encoded sizes** view and harness `session-patch-hot` fixture.

## Regenerating the pinned snapshot

```bash
pnpm bench -- --backend napi --time-ms 1500 --warmup-ms 500 \
  --json-out results/pinned-snapshot.json
```

Copy size tables into this page and into [Why Twilic](/guide/why) when fixtures or codecs change. Keep `docs/public/benchmark-snapshot.json` on the website in sync.
