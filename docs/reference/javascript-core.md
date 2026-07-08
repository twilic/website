# @twilic/core

The main JavaScript/TypeScript entrypoint. Provides stateless Dynamic profile encoding, session encoder creation, and runtime initialization for Node.js (N-API) and browser (WASM) backends.

**Package:** `@twilic/core`  
**Source:** [github.com/twilic/twilic-js](https://github.com/twilic/twilic-js)

For batch encoding, schema-aware encoding, and transport-JSON helpers, use [`@twilic/core/advanced`](/reference/javascript-advanced).

## Install

```bash
pnpm add @twilic/core
```

## Initialization

Call `init()` once before the first `encode` or `decode`. On Node.js the N-API backend is selected automatically; in browsers WASM is loaded.

```ts
import { init } from "@twilic/core";

await init();
```

### `init(options?)`

```ts
interface InitOptions {
  prefer?: "napi" | "wasm";
  wasmInput?: WasmInput;
}

async function init(options?: InitOptions): Promise<"napi" | "wasm">;
```

| Option | Description |
| --- | --- |
| `prefer` | Force N-API (Node.js) or WASM backend |
| `wasmInput` | Custom WASM module source for browser bundlers. Must come from your asset pipeline — never from untrusted user input |

**Browser example:**

```ts
import { init } from "@twilic/core";
import wasmUrl from "@twilic/core/wasm/twilic_wasm_bg.wasm?url";

await init({ prefer: "wasm", wasmInput: wasmUrl });
```

## Dynamic encoding

Stateless encode/decode of arbitrary [TwilicValue](/reference/value-and-schema) trees.

### `encode(value)`

```ts
function encode(value: TwilicValue): Uint8Array;
```

Encodes a single value using the Dynamic profile. First occurrence of each shape pays full self-describing cost; repeated structure within a message is interned automatically.

### `decode(bytes)`

```ts
function decode(bytes: Uint8Array): TwilicValue;
```

Decodes a v2 payload. Throws `TwilicDecodeError` when decode depth exceeds the limit. See [Errors & Limits](/reference/errors-and-limits).

```ts
import { init, encode, decode } from "@twilic/core";

await init();

const value = { id: 1001n, name: "alice", active: true };
const bytes = encode(value);
const restored = decode(bytes);
```

## Session encoder

For stateful streams (WebSocket, gRPC streams, ordered message queues). See [Session Encoder](/reference/session-encoder) for full API and options.

### `createSessionEncoder(options?)`

```ts
function createSessionEncoder(options?: SessionOptions): SessionEncoder;
```

Returns a `SessionEncoder` instance with persistent encoder state.

### `SessionEncoder`

```ts
class SessionEncoder {
  encode(value: TwilicValue): Uint8Array;
  encodeBatch(values: TwilicValue[]): Uint8Array;
  encodePatch(value: TwilicValue): Uint8Array;
  encodeMicroBatch(values: TwilicValue[]): Uint8Array;
  reset(): void;
}
```

| Method | Description |
| --- | --- |
| `encode()` | Full message — establishes or refreshes session baseline |
| `encodeBatch()` | Row batch with shape interning across records |
| `encodePatch()` | Sends only changed fields since last `encode()` |
| `encodeMicroBatch()` | Small batch optimized for streaming pipelines |
| `reset()` | Clears session state; next `encode()` sends a full frame |

::: warning HTTP APIs Do not use `SessionEncoder` on stateless HTTP request/response cycles. Use `encode()` / `encodeBatch()` from [`@twilic/core/advanced`](/reference/javascript-advanced) instead. :::

## Exported types

```ts
export type {
  TwilicValue,
  Schema,
  SchemaField,
  SessionOptions,
  UnknownReferencePolicy,
  InitOptions,
  WasmInput,
};
```

## Exported errors

```ts
export { TwilicDecodeError, DEFAULT_MAX_DECODE_DEPTH, decodeDepthLimitMessage };
```

## Backend selection

| Environment | Default backend | Notes |
| --- | --- | --- |
| Node.js 24+ | N-API (`twilic-napi`) | Highest throughput |
| Browser / edge | WASM | Requires `init()` with `wasmInput` in bundled apps |
| Deno / Bun | WASM or N-API if available | Use `prefer` to force |

```ts
const backend = await init({ prefer: "wasm" });
console.log(backend); // "wasm" | "napi"
```

## BigInt

Integers outside `Number.MAX_SAFE_INTEGER` must use `bigint`:

```ts
encode({ transaction_id: 9007199254740993n });
```

Decoded u64/i64 values are returned as `bigint`.

## Package exports

`package.json` exposes:

| Subpath                 | Content                                        |
| ----------------------- | ---------------------------------------------- |
| `@twilic/core`          | Main API (this page)                           |
| `@twilic/core/advanced` | [Advanced API](/reference/javascript-advanced) |

There are no `@twilic/core/napi` or `@twilic/core/wasm` subpath exports. Use `init({ prefer: "napi" | "wasm" })` instead.

## Related

- [JavaScript Advanced API](/reference/javascript-advanced)
- [Web Integrations](/integrations/)
- [Stateful Streams guide](/guide/stateful-streams)
