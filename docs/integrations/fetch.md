# @twilic/fetch

Twilic helpers for the Fetch API — encode request bodies and decode responses with `application/vnd.twilic`.

**Package:** `@twilic/fetch`  
**Peer dependency:** `@twilic/core`  
**Source:** [github.com/twilic/fetch](https://github.com/twilic/fetch)

## Install

```bash
pnpm add @twilic/fetch @twilic/core
```

## Quick start

```ts
import { init } from "@twilic/core";
import { twilicFetchJson } from "@twilic/fetch";

await init({ prefer: "wasm" }); // browser

const users = await twilicFetchJson("/api/users", {
  method: "GET",
  headers: { Accept: "application/vnd.twilic" },
});
```

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
```

### Functions

#### `twilicFetch(input, init?)`

Returns a raw `Response` with Twilic-encoded body when `twilicBody` is set.

```ts
function twilicFetch(
  input: RequestInfo | URL,
  init?: TwilicFetchInit,
): Promise<Response>;
```

#### `twilicFetchJson(input, init?)`

Encodes request (if `twilicBody` set) and decodes Twilic response to a value.

```ts
function twilicFetchJson<T = TwilicValue>(
  input: RequestInfo | URL,
  init?: TwilicFetchInit,
): Promise<T>;
```

#### `parseTwilicResponse(response, options?)`

Decode a `Response` body as Twilic.

```ts
function parseTwilicResponse<T = TwilicValue>(
  response: Response,
  options?: ParseTwilicResponseOptions,
): Promise<T>;
```

#### `createTwilicFetch(codec?, fetchImpl?)`

Factory for custom codec or fetch implementation (testing, Node polyfill).

```ts
function createTwilicFetch(
  codec?: TwilicCodec,
  fetchImpl?: typeof fetch,
): TwilicFetch;
```

### Types

```ts
interface TwilicFetchInit extends RequestInit {
  twilicBody?: TwilicValue;
}

interface ParseTwilicResponseOptions {
  requireContentType?: boolean; // default: true
}

interface TwilicFetch {
  fetch: (input, init?) => Promise<Response>;
  parseResponse: <T>(response, options?) => Promise<T>;
  fetchJson: <T>(input, init?) => Promise<T>;
}
```

## POST example

```ts
const result = await twilicFetchJson("/api/events", {
  method: "POST",
  twilicBody: {
    timestamp: Date.now(),
    service: "api",
    level: "info",
  },
});
```

When `twilicBody` is set:

- Body is encoded with `codec.encode()`
- `Content-Type: application/vnd.twilic` is set automatically

## Node.js vs browser

| Environment    | Init                                                 |
| -------------- | ---------------------------------------------------- |
| Node.js 24+    | `await init()` — N-API backend                       |
| Browser        | `await init({ prefer: "wasm", wasmInput: wasmUrl })` |
| Edge (Workers) | WASM with bundled `.wasm` asset                      |

## Custom fetch (testing)

```ts
const client = createTwilicFetch(undefined, mockFetch);
await client.fetchJson("/test", { twilicBody: { ping: true } });
```

## Related

- [Hono server](/integrations/hono)
- [Axios client](/integrations/axios)
- [JavaScript Core](/reference/javascript-core)
