# @twilic/fastify

Twilic plugin, parser, and reply helpers for [Fastify](https://fastify.dev).

**Package:** `@twilic/fastify`  
**Peer dependencies:** `fastify`, `@twilic/core`  
**Source:** [github.com/twilic/fastify](https://github.com/twilic/fastify)

## Install

```bash
pnpm add @twilic/fastify fastify @twilic/core
```

## Quick start

```ts
import Fastify from "fastify";
import { init } from "@twilic/core";
import { twilicPlugin, twilicParser, twilicReply } from "@twilic/fastify";

await init();

const app = Fastify();
await app.register(twilicPlugin);

app.post("/data", { preHandler: twilicParser() }, (request, reply) => {
  return twilicReply(reply, { ok: true, received: request.twilicBody });
});
```

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
```

### Plugin

#### `twilicPlugin(options?)`

Registers the `reply.twilic()` decorator.

```ts
const twilicPlugin: FastifyPluginAsync<TwilicPluginOptions>;
```

After registration:

```ts
app.get("/ping", (_request, reply) => reply.twilic({ pong: true }));
```

### Functions

#### `twilicParser(options?)`

Pre-handler that decodes body into `request.twilicBody`.

```ts
function twilicParser(
  options?: TwilicParserOptions,
): preHandlerAsyncHookHandler;
```

#### `twilicReply(reply, value, init?)`

Send Twilic response.

```ts
function twilicReply(
  reply: FastifyReply,
  value: TwilicValue,
  init?: TwilicReplyInit,
): FastifyReply;
```

#### `createTwilicFastify(codec?)`

Factory with custom codec.

### Types

```ts
interface TwilicPluginOptions {
  codec?: TwilicCodec;
}

interface TwilicReplyInit {
  statusCode?: number;
  headers?: Record<string, string>;
}

interface TwilicParserOptions {
  requireContentType?: boolean;
}
```

## Content type parser

The plugin registers handling for `application/vnd.twilic` so Fastify preserves raw binary bodies for Twilic routes.

## Custom codec example

```ts
import { encodeBatch, decode, encode } from "@twilic/core/advanced";

await app.register(twilicPlugin, {
  codec: {
    encode: (v) => (Array.isArray(v) ? encodeBatch(v) : encode(v)),
    decode,
  },
});
```

## Related

- [Express middleware](/integrations/express)
- [Hono middleware](/integrations/hono)
