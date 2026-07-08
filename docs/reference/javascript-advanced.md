# @twilic/core/advanced

Extended JavaScript API for batch encoding, Bound profile (schema-aware) encoding, transport-JSON fast paths, and direct value encoding. Used by the [examples repository](https://github.com/twilic/examples) for production patterns.

**Import:**

```ts
import {
  encodeBatch,
  encodeWithSchema,
  createSessionEncoder,
  AdvancedSessionEncoder,
} from "@twilic/core/advanced";
```

Requires `init()` from either `@twilic/core` or `@twilic/core/advanced` before use.

## Stateless encoding

### `encode(value)` / `decode(bytes)`

Same as [`@twilic/core`](/reference/javascript-core) — re-exported for convenience.

### `encodeBatch(values)`

```ts
function encodeBatch(values: TwilicValue[]): Uint8Array;
```

Encodes an array of same-shape records as a single batch message. Field names are sent once; repeated strings are interned. Use for API list responses, cache warm-up snapshots, and telemetry flushes.

```ts
import { init, encodeBatch, decode } from "@twilic/core/advanced";

await init();

const users = Array.from({ length: 50 }, (_, i) => ({
  id: BigInt(i + 1),
  name: `user-${i}`,
  role: i % 3 === 0 ? "admin" : "member",
}));

const bytes = encodeBatch(users);
```

### `encodeWithSchema(schema, value)`

```ts
function encodeWithSchema(schema: Schema, value: TwilicValue): Uint8Array;
```

Encodes using the Bound profile. Field names are omitted from the wire; positions come from the schema. See [Value & Schema](/reference/value-and-schema) and [Schema-Bound Encoding](/guide/schema-bound).

## Transport JSON

Intermediate JSON representation that preserves Twilic type fidelity (including `bigint` and `Uint8Array`). Useful for debugging, golden tests, and crossing process boundaries before binary encoding.

### Serialization helpers

```ts
function toTransportJson(value: TwilicValue): string;
function fromTransportJson(valueJson: string): TwilicValue;
function toTransportJsonBatch(values: TwilicValue[]): string;
function toCompactJson(value: TwilicValue): string;
function toCompactJsonBatch(values: TwilicValue[]): string;
```

### Binary encode/decode via transport JSON

```ts
function encodeTransportJson(valueJson: string): Uint8Array;
function decodeToTransportJson(bytes: Uint8Array): string;
function encodeBatchTransportJson(valuesJson: string): Uint8Array;
function encodeCompactJson(json: string): Uint8Array;
function decodeToCompactJson(bytes: Uint8Array): string;
function encodeBatchCompactJson(json: string): Uint8Array;
```

### Convenience wrappers

```ts
function encodeCompact(value: TwilicValue): Uint8Array;
function encodeBatchCompact(values: TwilicValue[]): Uint8Array;
```

## Direct encoding

Bypasses the JavaScript value tree and sends typed transport objects directly to the Rust backend. Used internally; rarely needed in application code.

```ts
function encodeDirect(value: TwilicValue): Uint8Array;
function decodeDirect(bytes: Uint8Array): TwilicValue;
function encodeBatchDirect(values: TwilicValue[]): Uint8Array;
```

## AdvancedSessionEncoder

Full-featured session encoder with transport-JSON, compact, direct, and patch variants.

```ts
function createSessionEncoder(options?: SessionOptions): AdvancedSessionEncoder;
```

### Methods

| Method | Description |
| --- | --- |
| `encode(value)` | Full compact frame |
| `encodeTransportJson(json)` | Full frame from transport JSON string |
| `encodeWithSchema(schema, value)` | Bound profile frame |
| `encodeBatch(values)` | Row batch |
| `encodeBatchTransportJson(json)` | Batch from transport JSON |
| `encodePatch(value)` | State patch (changed fields only) |
| `encodePatchTransportJson(json)` | Patch from transport JSON |
| `encodeMicroBatch(values)` | Small streaming batch |
| `encodeMicroBatchTransportJson(json)` | Micro-batch from transport JSON |
| `encodeDirect(value)` | Direct typed encode |
| `encodeBatchDirect(values)` | Direct batch |
| `encodePatchDirect(value)` | Direct patch |
| `encodeCompact(value)` | Compact JSON path |
| `encodeCompactJson(json)` | Compact from JSON string |
| `encodeBatchCompact(values)` | Compact batch |
| `encodeBatchCompactJson(json)` | Compact batch from JSON |
| `encodePatchCompact(value)` | Compact patch |
| `encodePatchCompactJson(json)` | Compact patch from JSON |
| `encodeMicroBatchCompact(values)` | Compact micro-batch |
| `encodeMicroBatchCompactJson(json)` | Compact micro-batch from JSON |
| `reset()` | Clear session state |

## When to use which API

| Use case | API |
| --- | --- |
| Single object, HTTP body | `encode()` from `@twilic/core` |
| List of records, HTTP body | `encodeBatch()` |
| Fixed struct, max density | `encodeWithSchema()` |
| WebSocket tick (few fields change) | `createSessionEncoder()` + `encodePatch()` |
| Golden test fixtures | `toTransportJson()` / `fromTransportJson()` |
| CLI roundtrip debugging | `decodeToTransportJson()` |

## Related

- [Batch & Columnar guide](/guide/batch-and-columnar)
- [Session Encoder reference](/reference/session-encoder)
- [Examples — API response](https://github.com/twilic/examples)
