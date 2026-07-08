# Web Integrations

Official npm packages for sending and receiving Twilic payloads over HTTP. All packages share the same MIME type, codec interface, and `@twilic/core` dependency.

## Content type

```text
application/vnd.twilic
```

Every package exports `TWILIC_CONTENT_TYPE`. Set this header on Twilic request and response bodies.

## Package overview

| Package | Role | Reference |
| --- | --- | --- |
| `@twilic/hono` | Hono server middleware | [Hono](/integrations/hono) |
| `@twilic/express` | Express middleware | [Express](/integrations/express) |
| `@twilic/fastify` | Fastify plugin | [Fastify](/integrations/fastify) |
| `@twilic/fetch` | `fetch` client | [Fetch](/integrations/fetch) |
| `@twilic/axios` | Axios client | [Axios](/integrations/axios) |

## Shared codec interface

All integrations accept an optional custom codec:

```ts
interface TwilicCodec {
  encode: (value: TwilicValue) => Uint8Array;
  decode: (bytes: Uint8Array) => TwilicValue;
}
```

Use `createTwilicHono(codec)`, `createTwilicFetch(codec)`, etc. when you need batch encoding or a wrapped `@twilic/core/advanced` encoder.

## HTTP profile rules

| Profile             | HTTP-safe? | Notes                               |
| ------------------- | ---------- | ----------------------------------- |
| Dynamic (stateless) | Yes        | Single object bodies                |
| Batch               | Yes        | List endpoints, bulk export         |
| Bound (schema)      | Yes        | Fixed message types                 |
| Stateful (session)  | **No**     | Requires ordered persistent channel |

Use stateless profiles for request/response. Reserve stateful encoding for WebSocket or streaming connections. See [FAQ — HTTP](/guide/faq#can-i-use-twilic-over-http).

## Server setup pattern

```ts
// 1. Initialize core once at startup
import { init } from "@twilic/core";
await init();

// 2. Register Twilic routes separately from JSON routes
app.post("/internal/data", twilicParser(), handler);

// 3. Do not mount JSON body parser on the same path
```

## Client setup pattern

```ts
import { init } from "@twilic/core";
import { twilicFetchJson } from "@twilic/fetch";

await init();

const data = await twilicFetchJson("/api/users", {
  method: "GET",
  headers: { Accept: "application/vnd.twilic" },
});
```

## Content negotiation

Serve both JSON and Twilic on the same route with `Accept` header routing:

```ts
app.get("/users", async (req, res) => {
  const users = await fetchUsers();
  if (req.headers.accept?.includes("application/vnd.twilic")) {
    return twilicSend(res, users);
  }
  return res.json(users);
});
```

The [examples repository](https://github.com/twilic/examples) demonstrates this with `@twilic/hono`.

## Related

- [Transport & Framing](/guide/transport-framing)
- [JavaScript Core API](/reference/javascript-core)
- [Web Integrations guide](/guide/web-integrations)
