# JavaScript / TypeScript SDK

The JavaScript SDK provides Twilic v2 encoding with two backends:

- **Node.js**: N-API native addon (`twilic-napi`) — maximum throughput on the server
- **Browser / JS runtimes**: WebAssembly (`twilic-wasm`) — runs anywhere WASM is supported

Both backends are built from the [Rust reference implementation](/sdks/rust). Integers decode as `bigint` by default for safe i64/u64 handling.

## Requirements

- Node.js 24+
- Rust stable + `wasm-pack` (to build from source)

## Install

```bash
npm install @twilic/core
# or
pnpm add @twilic/core
# or
yarn add @twilic/core
```

## Quick Start

```ts
import { init, encode, decode } from "@twilic/core";

// Call init() once before using encode/decode
await init();

const value = {
  id: 1001n, // u64 as BigInt
  name: "alice",
  score: 98.6,
};

const bytes = encode(value);
const decoded = decode(bytes);

console.log(`encoded ${bytes.byteLength} bytes`);
```

## API Reference

### Initialization

```ts
// Initialize the WASM module (only needed once, no-op for N-API backend)
async function init(): Promise<void>;
```

### Dynamic Encoding

```ts
// Encode a value to Uint8Array
function encode(value: TwilicValue): Uint8Array;

// Decode a Uint8Array to a value
function decode(bytes: Uint8Array): TwilicValue;
```

### Schema-Aware Encoding

```ts
// Encode using Bound Profile
function encodeWithSchema(value: TwilicValue, schema: Schema): Uint8Array;
```

### Batch Encoding

```ts
// Encode an array of same-shape records
function encodeBatch(records: TwilicValue[]): Uint8Array;
```

### Session

```ts
import { SessionEncoder } from "@twilic/core";

const enc = new SessionEncoder();

// Encode with persistent state
const bytes = enc.encode(value);

// Encode a micro-batch
const bytes = enc.encodeMicroBatch(records);

// Encode a state patch
const bytes = enc.encodePatch(value);

// Reset
enc.reset();
```

### Transport JSON Fast Path

For situations where you need to pass structured data through a JSON transport without losing type fidelity:

```ts
// Encode to a transport-JSON-safe representation
function encodeTransportJson(value: TwilicValue): string;
function encodeBatchTransportJson(records: TwilicValue[]): string;

// Decode from transport-JSON representation
function decodeToTransportJson(bytes: Uint8Array): string;
```

## Backend Selection

By default the SDK selects the N-API backend on Node.js and WASM elsewhere. To force a backend:

```ts
import { init } from "@twilic/core/wasm"; // WASM only
import { init } from "@twilic/core/napi"; // N-API only (Node.js)
```

## BigInt Handling

i64 and u64 values are always `bigint` in JavaScript. This avoids precision loss for values outside the `Number.MAX_SAFE_INTEGER` range.

```ts
const value = { counter: 9007199254740993n }; // safe as bigint
```

## Build from Source

```bash
pnpm install
pnpm build
```

Build steps:

1. Build N-API addon (`native/twilic_napi.node`)
2. Build WASM package (`wasm/pkg/*`)
3. Build TypeScript output (`dist/*`)

## Project Layout

```text
twilic-js/
  src/           # TypeScript API layer
  native/        # N-API Rust bridge
  wasm/          # WASM Rust bridge
  tests/         # Node API tests (init, encode, decode, schema, batch, session)
  dist/          # Built TypeScript output
```

## Source

[github.com/twilic/twilic-js](https://github.com/twilic/twilic-js)
