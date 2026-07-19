# @twilic/hono

Twilic middleware and response helpers for [Hono](https://hono.dev).

**Package:** `@twilic/hono`  
**Peer dependency:** `hono`, `@twilic/core`  
**Source:** [github.com/twilic/hono](https://github.com/twilic/hono)

## Install

```bash
pnpm add @twilic/hono hono @twilic/core
```

## Quick start

```ts
import { Hono } from "hono";
import { init } from "@twilic/core";
import { twilicParser, twilicResponse } from "@twilic/hono";

await init();

const app = new Hono();

app.post("/users", twilicParser(), async (c) => {
  const input = c.var.twilicBody;
  return twilicResponse(c, { ok: true, received: input });
});

export default app;
```

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
```

### Functions

#### `twilicParser(options?)`

Middleware that decodes the request body and sets `c.var.twilicBody`.

```ts
function twilicParser<T = TwilicValue>(
  options?: TwilicParserOptions,
): MiddlewareHandler;
```

#### `twilicResponse(c, value, init?)`

Returns a `Response` with Twilic-encoded body and correct `Content-Type`.

```ts
function twilicResponse(
  c: Context,
  value: TwilicValue,
  init?: ResponseInit,
): Response;
```

#### `parseTwilic(c)`

Decode request body without middleware.

```ts
function parseTwilic<T = TwilicValue>(c: Context): Promise<T>;
```

#### `createTwilicHono(codec?)`

Factory for custom codec instances.

```ts
function createTwilicHono<T = TwilicValue>(codec?: TwilicCodec): TwilicHono<T>;
```

### Types

```ts
interface TwilicParserOptions {
  requireContentType?: boolean; // default: true
}

interface TwilicCodec {
  encode: (value: TwilicValue) => Uint8Array;
  decode: (bytes: Uint8Array) => TwilicValue;
}

interface TwilicHono<T = TwilicValue> {
  parse: (c: Context) => Promise<T>;
  response: (c: Context, value: TwilicValue, init?: ResponseInit) => Response;
  parser: (options?: TwilicParserOptions) => MiddlewareHandler;
}
```

## Batch responses

Use a custom codec with `encodeBatch` for list endpoints:

```ts
import { encodeBatch, decode } from "@twilic/core/advanced";
import { createTwilicHono } from "@twilic/hono";

const twilic = createTwilicHono({
  encode: (value) => {
    if (Array.isArray(value)) return encodeBatch(value);
    return encode(value);
  },
  decode,
});

app.get("/users", async (c) => {
  const users = await db.getUsers();
  return twilic.response(c, users);
});
```

## Error handling

When `requireContentType` is true (default) and the request lacks `application/vnd.twilic`, the middleware returns **415 Unsupported Media Type**.

## Cloudflare Workers

Hono runs on Workers out of the box. Initialize WASM before handling requests:

```ts
import { init } from "@twilic/core";
import wasmUrl from "@twilic/core/wasm/twilic_wasm_bg.wasm?url";

await init({ prefer: "wasm", wasmInput: wasmUrl });
```

## Related

- [Fetch client](/integrations/fetch)
- [Examples — HTTP Round-Trip](/guide/examples#http-round-trip)
- [Examples — API response](https://github.com/twilic/examples/tree/main/api-response)
- [Transport & Framing](/guide/transport-framing)
