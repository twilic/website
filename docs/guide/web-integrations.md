# Web Integrations

Twilic ships npm packages that encode and decode binary request and response bodies for common JavaScript web stacks. All integrations use the same MIME type and `@twilic/core` codec.

## Content type

Every package exports `TWILIC_CONTENT_TYPE`:

```text
application/vnd.twilic
```

Send and expect this `Content-Type` header on Twilic payloads. Integrations reject or skip decoding when the header does not match (configurable with `requireContentType: false` on parsers).

Use **stateless** Dynamic or Batch profiles for HTTP request/response. Stateful session compression requires a persistent ordered channel and is not appropriate for typical HTTP APIs. See [FAQ — Can I use Twilic over HTTP?](/guide/faq#can-i-use-twilic-over-http).

## Packages

| Package                                                | Use with           |
| ------------------------------------------------------ | ------------------ |
| [`@twilic/express`](https://github.com/twilic/express) | Express middleware |
| [`@twilic/fastify`](https://github.com/twilic/fastify) | Fastify plugin     |
| [`@twilic/hono`](https://github.com/twilic/hono)       | Hono middleware    |
| [`@twilic/axios`](https://github.com/twilic/axios)     | Axios interceptors |
| [`@twilic/fetch`](https://github.com/twilic/fetch)     | `fetch` helpers    |

All packages depend on [`@twilic/core`](/sdks/js). Install the integration package plus its framework peer dependency.

## Express

```bash
pnpm add @twilic/express express @twilic/core
```

```ts
import express from "express";
import { twilicParser, twilicSend } from "@twilic/express";

const app = express();

app.post("/users", twilicParser(), (req, res) => {
  twilicSend(res, { ok: true, received: req.twilicBody });
});
```

Do not mount `express.json()` before Twilic routes on the same path, or the request body stream will already be consumed. Use a dedicated router or place `twilicParser()` only on routes that do not use JSON body parsing.

## Fastify

```bash
pnpm add @twilic/fastify fastify @twilic/core
```

```ts
import Fastify from "fastify";
import { twilicParser, twilicPlugin, twilicReply } from "@twilic/fastify";

const app = Fastify();

await app.register(twilicPlugin);

app.post("/users", { preHandler: twilicParser() }, (request, reply) => {
  return twilicReply(reply, { ok: true, received: request.twilicBody });
});

// or use the reply decorator:
app.get("/ping", (_request, reply) => reply.twilic({ pong: true }));
```

## Hono

```bash
pnpm add @twilic/hono hono @twilic/core
```

```ts
import { Hono } from "hono";
import { twilicParser, twilicResponse } from "@twilic/hono";

const app = new Hono();

app.post("/users", twilicParser(), async (c) => {
  const input = c.var.twilicBody;
  return twilicResponse(c, { ok: true, received: input });
});
```

## Axios

```bash
pnpm add @twilic/axios axios @twilic/core
```

```ts
import axios from "axios";
import { createTwilicAxios } from "@twilic/axios";

const client = createTwilicAxios(axios.create());

const { data } = await client.post("/api/users", null, {
  twilicBody: { id: 1n, name: "alice" },
});
```

Set `twilicResponse: false` on a request when you expect a non-Twilic response body.

## Fetch

```bash
pnpm add @twilic/fetch @twilic/core
```

```ts
import { init } from "@twilic/core";
import { twilicFetchJson } from "@twilic/fetch";

// In the browser, initialize the WASM backend once before calling helpers.
await init({ prefer: "wasm" });

const data = await twilicFetchJson("/api/users", {
  method: "POST",
  twilicBody: { id: 1n, name: "alice" },
});
```

On Node.js, `@twilic/core` selects the N-API backend by default and `init()` is still recommended before first use.

## Custom codec

Each integration accepts an optional codec object with `encode` and `decode` functions. Use `createTwilicExpress`, `createTwilicFastify`, `createTwilicHono`, `createTwilicAxios`, or `createTwilicFetch` when you need a custom `@twilic/core` configuration.

## Related

- [JavaScript / TypeScript SDK](/sdks/js)
- [Twilic CLI](/guide/cli) — encode and decode from the terminal
- [Cookbook — API Response with Repeated Structure](/guide/cookbook#api-response-with-repeated-structure)
