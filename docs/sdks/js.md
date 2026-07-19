# JavaScript / TypeScript SDK

The JavaScript SDK provides Twilic v3 encoding with two backends and two package entrypoints.

- **Node.js:** N-API native addon — maximum throughput
- **Browser / edge:** WebAssembly — runs anywhere WASM is supported

Both backends are built from the [Rust reference implementation](/reference/rust).

## Requirements

- Node.js 24+
- Rust stable + `wasm-pack` (to build from source)

## Install

```bash
pnpm add @twilic/core
```

For batch, schema, and transport-JSON APIs:

```bash
# same package — advanced subpath
import { encodeBatch } from "@twilic/core/advanced";
```

## Package exports

| Subpath | Content |
| --- | --- |
| `@twilic/core` | [Core API](/reference/javascript-core): `init`, `encode`, `decode`, `createSessionEncoder` |
| `@twilic/core/advanced` | [Advanced API](/reference/javascript-advanced): batch, schema, transport-JSON, direct encoding |

There are no separate `@twilic/core/napi` or `@twilic/core/wasm` npm subpaths. Select backend via `init({ prefer })`.

## Quick start

```ts
import { init, encode, decode } from "@twilic/core";

await init();

const value = {
  id: 1001n,
  name: "alice",
  score: 98.6,
};

const bytes = encode(value);
const decoded = decode(bytes);
```

## Batch encoding

```ts
import { init, encodeBatch, decode } from "@twilic/core/advanced";

await init();

const bytes = encodeBatch(records); // same-shape array
```

## v3 schema batch and bound stream

```ts
import {
  init,
  encodeBatchWithSchema,
  encodeBoundStream,
} from "@twilic/core/advanced";

await init();

const batch = encodeBatchWithSchema(schema, records);
const stream = encodeBoundStream(schema, records);
```

## Session encoding

```ts
import { init, createSessionEncoder } from "@twilic/core";

await init();

const enc = createSessionEncoder();
enc.encode(fullValue);
enc.encodePatch(updatedValue);
enc.reset();
```

See [Session Encoder reference](/reference/session-encoder) and [Stateful Streams](/guide/stateful-streams).

## Backend selection

```ts
import { init } from "@twilic/core";

// Node.js — N-API (default)
await init();

// Browser — WASM
import wasmUrl from "@twilic/core/wasm/twilic_wasm_bg.wasm?url";
await init({ prefer: "wasm", wasmInput: wasmUrl });

// Force backend
await init({ prefer: "napi" });
```

## BigInt

i64 and u64 values must use `bigint`:

```ts
encode({ counter: 9007199254740993n });
```

Decoded integers outside safe integer range return as `bigint`.

## Web framework integrations

| Package                                    | Role               |
| ------------------------------------------ | ------------------ |
| [`@twilic/hono`](/integrations/hono)       | Hono middleware    |
| [`@twilic/express`](/integrations/express) | Express middleware |
| [`@twilic/fastify`](/integrations/fastify) | Fastify plugin     |
| [`@twilic/fetch`](/integrations/fetch)     | Fetch client       |
| [`@twilic/axios`](/integrations/axios)     | Axios client       |

See [Integrations overview](/integrations/) and [Web Integrations guide](/guide/web-integrations).

## Full API reference

- [JavaScript Core API](/reference/javascript-core)
- [JavaScript Advanced API](/reference/javascript-advanced)
- [Value & Schema types](/reference/value-and-schema)
- [Errors & Limits](/reference/errors-and-limits)

## Build from source

```bash
git clone https://github.com/twilic/twilic-js.git
cd twilic-js
pnpm install
pnpm build
```

Build steps: N-API addon → WASM package → TypeScript output.

## Source

[github.com/twilic/twilic-js](https://github.com/twilic/twilic-js)
