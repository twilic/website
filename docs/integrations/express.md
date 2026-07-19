# @twilic/express

Twilic request parsing and response sending for [Express](https://expressjs.com).

**Package:** `@twilic/express`  
**Peer dependencies:** `express`, `@twilic/core`  
**Source:** [github.com/twilic/express](https://github.com/twilic/express)

## Install

```bash
pnpm add @twilic/express express @twilic/core
```

## Quick start

```ts
import express from "express";
import { init } from "@twilic/core";
import { twilicParser, twilicSend } from "@twilic/express";

await init();

const app = express();

app.post("/internal/data", twilicParser(), (req, res) => {
  twilicSend(res, { ok: true, received: req.twilicBody });
});
```

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
```

### Functions

#### `twilicParser(options?)`

Express middleware. Decodes body into `req.twilicBody`.

```ts
function twilicParser(options?: TwilicParserOptions): RequestHandler;
```

#### `twilicSend(res, value, init?)`

Send Twilic-encoded response.

```ts
function twilicSend(
  res: Response,
  value: TwilicValue,
  init?: TwilicSendInit,
): void;
```

#### `parseTwilic(req)`

Decode request body without middleware.

```ts
function parseTwilic<T = TwilicValue>(req: Request): Promise<T>;
```

#### `createTwilicExpress(codec?)`

Factory with custom codec.

```ts
function createTwilicExpress<T = TwilicValue>(
  codec?: TwilicCodec,
): TwilicExpress<T>;
```

### Types

```ts
interface TwilicParserOptions {
  requireContentType?: boolean;
}

interface TwilicSendInit {
  status?: number;
  headers?: Record<string, string>;
}

interface TwilicExpress<T = TwilicValue> {
  parse: (req: Request) => Promise<T>;
  send: (res: Response, value: TwilicValue, init?: TwilicSendInit) => void;
  parser: (options?: TwilicParserOptions) => RequestHandler;
}
```

## Router isolation

Do **not** mount `express.json()` on Twilic routes — the body stream will be consumed.

```ts
const twilicRouter = express.Router();
twilicRouter.post("/data", twilicParser(), handler);
app.use("/internal", twilicRouter);

app.use(express.json()); // JSON routes only
app.use("/api", jsonRouter);
```

## TypeScript augmentation

`req.twilicBody` is typed via module augmentation when using the middleware.

## Related

- [Fastify plugin](/integrations/fastify)
- [Web Integrations guide](/guide/web-integrations)
- [Examples — HTTP Round-Trip](/guide/examples#http-round-trip)
