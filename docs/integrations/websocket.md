# @twilic/websocket

Twilic helpers for binary WebSocket frames — one message equals one Twilic value.

**Package:** `@twilic/websocket`  
**Peer dependency:** `@twilic/core`  
**Source:** [github.com/twilic/websocket](https://github.com/twilic/websocket)

## Install

```bash
pnpm add @twilic/websocket @twilic/core
```

## Quick start

```ts
import { init } from "@twilic/core";
import { createTwilicWebSocket } from "@twilic/websocket";

await init(); // browser: init({ prefer: "wasm" })

const twilic = createTwilicWebSocket(new WebSocket("ws://localhost:8788"));

twilic.onMessage((value) => {
  console.log(value);
});

twilic.send({ id: 1n, name: "alice" });
```

One WebSocket message = one Twilic frame. Send **binary** frames only (`opcode 0x2`). Text frames are rejected by default.

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
export const DEFAULT_MESSAGE_LIMIT = 1_048_576; // 1 MiB
```

`TWILIC_CONTENT_TYPE` matches other integrations for codec consistency. WebSocket framing uses binary opcode instead of HTTP headers.

### Functions

#### `twilicSend(socket, value)`

Encode `value` and send it as a binary WebSocket frame.

```ts
function twilicSend(socket: TwilicSocket, value: TwilicValue): void;
```

Works with the browser / Node `WebSocket` API and with [`ws`](https://github.com/websockets/ws) (second argument `{ binary: true }` is set; the standard API ignores it).

#### `parseTwilicMessage(data, options?)`

Decode an inbound frame to a Twilic value.

```ts
function parseTwilicMessage<T = TwilicValue>(
  data: TwilicMessageData,
  options?: TwilicMessageOptions,
): Promise<T>;
```

#### `attachTwilicWebSocket(socket, listener, options?)`

Attach a decoded-value listener. Returns a detach function.

```ts
function attachTwilicWebSocket<T = TwilicValue>(
  socket: TwilicSocket,
  listener: (value: T) => void,
  options?: TwilicAttachOptions,
): () => void;
```

Uses `socket.on("message")` when available (`ws`), otherwise `addEventListener`. Sets `binaryType = "arraybuffer"` when the property exists. Decode errors go to `options.onError` when provided; they are not passed to `listener`.

#### `createTwilicWebSocket(socket, options?)`

Bind one browser `WebSocket` or [`ws`](https://github.com/websockets/ws) socket. Stateful mode keeps that connection's encoder and decoder on the returned object.

```ts
function createTwilicWebSocket<T = TwilicValue>(
  socket: TwilicSocket,
  options?: TwilicWebSocketOptions,
): TwilicWebSocket<T>;
```

`send(value)` returns the encoded bytes. `onMessage(listener)` decodes each inbound frame once and returns an unsubscribe function. Closing the socket ends the session.

### Types

```ts
interface TwilicCodec {
  encode: (value: TwilicValue) => Uint8Array;
  decode: (bytes: Uint8Array) => TwilicValue;
}

interface TwilicMessageOptions {
  requireBinary?: boolean; // default: true
  isBinary?: boolean; // pass ws `isBinary` when available
  limit?: number; // max frame bytes; default 1 MiB
}

interface TwilicAttachOptions extends TwilicMessageOptions {
  onError?: (error: unknown) => void;
}

interface TwilicWebSocketOptions {
  stateful?: boolean;
  session?: SessionOptions;
  codec?: TwilicCodec;
  requireBinary?: boolean;
  limit?: number;
  onError?: (error: unknown) => void;
}

interface TwilicWebSocket<T = TwilicValue> {
  send: (value: TwilicValue) => Uint8Array;
  onMessage: (listener: (value: T) => void) => () => void;
  parseMessage: (
    data: TwilicMessageData,
    options?: TwilicMessageOptions,
  ) => Promise<T>;
}
```

### Errors

| Error | When |
| --- | --- |
| `TwilicUnsupportedFrameError` | Text frame while `requireBinary` is true, or unsupported data type |
| `TwilicMessageLimitError` | Frame larger than `limit` (checked before decode) |
| `RangeError` | Invalid `limit` (not a non-negative safe integer) |

## Stateful sessions

Enable the Twilic WebSocket Stateful Profile so each connection keeps an independent outbound encoder and inbound decoder:

```ts
import { init } from "@twilic/core";
import { createTwilicWebSocket } from "@twilic/websocket";

await init();

const twilic = createTwilicWebSocket(socket, {
  stateful: true,
  session: { maxBaseSnapshots: 8 },
});

twilic.onMessage((value) => {
  console.log(value);
});

twilic.send({ x: 100, y: 200, hp: 100 }); // full baseline
twilic.send({ x: 101, y: 200, hp: 100 }); // STATE_PATCH when beneficial
```

Closing the socket ends the session. A reconnect is a new `createTwilicWebSocket()` call, and its first `send()` is a full frame. Previous base snapshots are not inherited.

A custom `codec` is for stateless connections. `stateful: true` and a custom codec cannot be combined.

See [Stateful Streams](/guide/stateful-streams), [Stateful Decoding](/guide/stateful-decoding), and the [websocket-session example](https://github.com/twilic/examples/tree/main/websocket-session).

## Message limits

Inbound frames are rejected before decode when they exceed `DEFAULT_MESSAGE_LIMIT` (1 MiB) or a custom `limit`:

```ts
await parseTwilicMessage(data, { limit: 64 * 1024 });
```

## Related

- [Transport & Framing](/guide/transport-framing#websocket)
- [Stateful Streams](/guide/stateful-streams)
- [Fetch client](/integrations/fetch)
- [Examples — WebSocket Session](/guide/examples#websocket-session)
