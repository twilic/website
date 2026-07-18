# Benchmark Fixtures

The [benchmark harness](https://github.com/twilic/benchmark) and [Playground](/guide/playground) use the same named payloads. This page documents what each fixture contains so you can interpret size and throughput numbers correctly.

## Fixture catalog

| Name | Records | Shape | Purpose |
| --- | --- | --- | --- |
| `single-small` | 1 | Nested 6-field object | Baseline single-record comparison |
| `batch-homogeneous-256` | 256 | Identical 6-field schema | Shape interning win |
| `batch-mixed-256` | 256 | 4 variant shapes (rotating) | Realistic heterogeneous batch |
| `patch-session` | 2 ticks | Same object, 1 field change | Stateful patch savings |

## single-small

One user-like object with nested profile:

```json
{
  "id": 1234,
  "userId": 987654,
  "name": "alice",
  "active": true,
  "score": 98.5,
  "tags": ["edge", "premium", "ap-northeast-1"],
  "profile": {
    "country": "JP",
    "locale": "ja-JP",
    "timeZone": "Asia/Tokyo"
  }
}
```

**What it tests:** Single-record encode/decode throughput. Twilic ≈ MessagePack size (no batch interning yet).

**Compared formats:** Twilic, MessagePack, CBOR, BSON, JSON.

## batch-homogeneous-256

256 records with identical field layout:

```json
{
  "id": 1,
  "userId": 100001,
  "active": true,
  "tier": "standard",
  "country": "JP",
  "usage": { "requests": 5001, "errors": 1 }
}
```

Fields vary by index (`tier` alternates `"gold"` / `"standard"`, `country` mostly `"JP"`), but shape is fixed.

**What it tests:** Row batch shape interning and string dedup. Twilic typically benefits strongly versus MessagePack because repeated field names and repeated strings are amortized.

## batch-mixed-256

256 records rotating through 4 different object shapes:

| Variant | Distinct fields                             |
| ------- | ------------------------------------------- |
| Type A  | `id`, `tenant`, `active`, `metrics`, `tags` |
| Type B  | `id`, `name`, `score`, `flags`              |
| Type C  | `id`, `status`, `count`, `metadata`         |
| Type D  | `id`, `value`, `timestamp`, `source`        |

**What it tests:** Batch compression when schema is not uniform. Twilic still wins but margin is smaller than homogeneous batch.

## patch-session

Two consecutive values representing a stateful stream tick:

**Tick 1 (full frame):**

```json
{
  "id": 9001,
  "status": "active",
  "score": 99.1,
  "profile": { "country": "JP", "locale": "ja-JP", "timeZone": "Asia/Tokyo" }
}
```

**Tick 2 (patch — only `score` changes):**

```json
{
  "id": 9001,
  "status": "active",
  "score": 99.2,
  "profile": { "country": "JP", "locale": "ja-JP", "timeZone": "Asia/Tokyo" }
}
```

**What it tests:** `encodePatch()` vs full `encode()` on tick 2. Patch is typically **85–92% smaller** than re-encoding the full object.

## Twilic encode variants (benchmark `--mode max`)

The extended benchmark suite also measures internal encode paths:

| Variant     | API                     | Description                 |
| ----------- | ----------------------- | --------------------------- |
| default     | `encode()`              | Standard Dynamic profile    |
| direct      | `encodeDirect()`        | Bypass JS value tree        |
| compact     | `encodeCompact()`       | Compact JSON intermediate   |
| raw json    | `encodeTransportJson()` | Transport-JSON string input |
| compact raw | `encodeCompactJson()`   | Pre-serialized compact JSON |

See [Performance — JS hot paths](/guide/performance).

## Playground alignment

The [Playground](/guide/playground) **Encoded sizes** view uses these same fixture names. You can also paste custom JSON to compare ad-hoc payloads.

The **Schema-first** view uses `UserRecordV1` from [schema-example.json](https://github.com/twilic/twilic/blob/main/examples/schema-example.json) at ×1, ×3, and ×256 record counts. v3 reports should compare `BOUND_STREAM` and `SCHEMA_BATCH` against Protobuf, Avro, FlatBuffers, and Arrow IPC with schema sharing and framing assumptions disclosed.

## Examples repo fixtures

Shared fixtures in [examples/shared/fixtures.ts](https://github.com/twilic/examples/blob/main/shared/fixtures.ts) power the runnable examples:

| Example       | Fixture helper    | Profile                      |
| ------------- | ----------------- | ---------------------------- |
| API response  | User list page    | Batch                        |
| Telemetry     | Event array       | `col_batch` / `SCHEMA_BATCH` |
| Cache payload | Session blob      | Dynamic                      |
| Logs          | Log events        | Batch / micro-batch          |
| WebSocket     | Dashboard metrics | Stateful                     |

## Running benchmarks

```bash
git clone https://github.com/twilic/benchmark.git
cd benchmark
pnpm install
pnpm bench                              # standard suite
pnpm bench -- --mode max                # all encode variants
pnpm bench -- --twilic-vs-msgpack-only  # hide JSON rows
pnpm bench -- --backend wasm            # WASM backend
```

## Related

- [Benchmark overview](/benchmark)
- [Performance guide](/guide/performance)
- [Playground](/guide/playground)
