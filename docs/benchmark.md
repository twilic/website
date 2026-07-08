# Benchmark

This page summarizes the benchmark results from the Twilic benchmark harness. Measurements are taken using `@twilic/core` on Node.js 24 (N-API backend) against MessagePack and JSON baselines.

For interactive size comparisons in the browser, see the [Playground](/guide/playground). For quick terminal benchmarks, use [`twilic bench`](/guide/cli#run-benchmarks). For fixture definitions (`single-small`, `batch-256`, `patch-session`), see [Benchmark Fixtures](/benchmark/fixtures).

## Setup

The benchmark harness lives in the `twilic/benchmark` repository. To run it yourself:

```bash
git clone https://github.com/twilic/benchmark
cd benchmark
pnpm install
pnpm bench
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

| Benchmark                 | Description                                     |
| ------------------------- | ----------------------------------------------- |
| Single record encode      | Encode one object with a representative schema  |
| Single record decode      | Decode one Twilic payload                       |
| 256-record batch encode   | Encode 256 same-shape records                   |
| 256-record batch decode   | Decode a 256-record Twilic batch                |
| MessagePack encode/decode | Baseline for single and batch                   |
| JSON stringify/parse      | Baseline for single and batch                   |
| State patch encode        | `encodePatch` on a hot object stream            |
| Transport-JSON fast path  | `encodeTransportJson` / `decodeToTransportJson` |

## Payload Size Comparison

Twilic's size advantage grows with repetition. Representative results on a 256-record batch with a 6-field object schema:

| Format | Single record (bytes) | 256-record batch (bytes) | Ratio vs JSON |
| --- | --- | --- | --- |
| JSON | ~120 | ~30,720 | 1.0× |
| MessagePack | ~80 | ~20,480 | 0.67× |
| Twilic (Dynamic) | ~75 | ~8,960 | 0.29× |
| Twilic (Columnar) | ~70 | ~4,200 | 0.14× |

_Numbers are approximate; exact values depend on schema and data distribution._

The key insight: Twilic's advantage is **multiplicative** at batch scale. Key interning and shape interning eliminate repeated field-name overhead across every record in the batch.

## Throughput

On a single record, Twilic and MessagePack have comparable throughput — both are significantly faster than JSON parse/stringify. Twilic's overhead vs MessagePack on a single record is encoder state initialization, which is amortized across a batch.

For the N-API backend on Node.js 24, typical throughput:

| Operation               | Twilic (N-API)  | MessagePack     |
| ----------------------- | --------------- | --------------- |
| Single encode           | ~500k ops/s     | ~550k ops/s     |
| Single decode           | ~480k ops/s     | ~530k ops/s     |
| 256-record batch encode | ~8k batches/s   | ~3.5k batches/s |
| 256-record batch decode | ~7.5k batches/s | ~3k batches/s   |

_Throughput numbers are illustrative; run the harness for your exact hardware._

## Max Speed Tips

- Use `--backend napi` on Node.js (highest throughput)
- Use Node.js 24+ (project baseline, JIT-optimized)
- Increase run windows for stability: `--time-ms 3000 --warmup-ms 1000`
- For hot paths: pre-serialize once with transport-JSON APIs, then use raw encode methods
- Prefer columnar batch (`col_batch`) for large, regular datasets

## State Patch Performance

On a hot object stream where 2 of 20 fields change per tick, `encodePatch` reduces payload size by 85–92% compared to re-encoding the full object. The patch overhead (patch header + changed field encoding) is small relative to the savings.

## Running the Full Suite

```bash
# Full suite
pnpm bench -- --mode full

# Extended suite with all workloads
pnpm bench -- --mode max

# Twilic vs MessagePack only (no JSON rows)
pnpm bench -- --twilic-vs-msgpack-only

# WASM backend comparison
pnpm bench -- --backend wasm --time-ms 2000
```

Results are printed as formatted CLI tables with throughput (ops/sec) and payload size columns side by side.
