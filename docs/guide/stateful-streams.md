# Stateful Streams

Stateful encoding is Twilic's highest-leverage optimization for long-lived connections where most fields stay stable between updates. This guide covers when to use it, how sessions work, and production recovery patterns.

## When stateful wins

| Signal                              | Stateful fit                     |
| ----------------------------------- | -------------------------------- |
| Connection stays open > 10 seconds  | Strong                           |
| < 30% of fields change per message  | Strong                           |
| Thousands of concurrent connections | Strong (egress savings compound) |
| Independent unrelated events        | Poor — use Batch instead         |
| HTTP request/response               | **Never**                        |

## Architecture

```text
[Producer]                         [Consumer]
SessionEncoder                     SessionDecoder (or decode full frames)
    |                                    |
    |-- encode() full frame ------------>|  establish baseline
    |-- encodePatch() 30 bytes --------->|  apply patch
    |-- encodePatch() 45 bytes --------->|  apply patch
    |   (disconnect)                     |
    |-- reset()                          |
    |-- encode() full frame ------------>|  re-establish
```

## JavaScript implementation

```ts
import { init, createSessionEncoder } from "@twilic/core";

await init();

const enc = createSessionEncoder({
  enableStatePatch: true,
  unknownReferencePolicy: "statelessRetry",
});

// Server WebSocket handler
ws.on("connection", (socket) => {
  const interval = setInterval(() => {
    const metrics = collectMetrics();
    const bytes = tick === 0 ? enc.encode(metrics) : enc.encodePatch(metrics);
    socket.send(bytes);
    tick++;
  }, 50);

  socket.on("close", () => {
    clearInterval(interval);
    enc.reset();
    tick = 0;
  });
});
```

For all encoding variants see [`AdvancedSessionEncoder`](/reference/javascript-advanced).

## Session options

Configure via [SessionOptions](/reference/session-encoder):

| Option | Recommendation |
| --- | --- |
| `enableStatePatch` | `true` for dashboards; `false` if every message is unrelated |
| `enableTrainedDictionary` | `true` when string fields repeat across ticks |
| `enableTemplateBatch` | `true` for columnar streaming batches |
| `unknownReferencePolicy` | `"statelessRetry"` on clients that reconnect |
| `maxBaseSnapshots` | `8` default; increase if many concurrent entity bases |

## Patch selection behavior

The encoder compares the new value against the last encoded value and emits a `StatePatch` when fewer fields changed than a full re-encode would cost. Static fields (region, host, version) stay as `Keep` operations on the wire.

On a 15-field metric object with 2 changing fields:

| Method          | Typical size |
| --------------- | ------------ |
| `encode()` full | ~250 bytes   |
| `encodePatch()` | ~30–50 bytes |

## Recovery after disconnect

Clients lose session state on reconnect. Always:

1. Call `enc.reset()` on the producer
2. Send a full `encode()` frame as the first post-reconnect message
3. Resume `encodePatch()` on subsequent ticks

```ts
function onReconnect() {
  enc.reset();
  send(enc.encode(currentState));
}
```

## Error handling

Count consecutive decode failures on the consumer. After a threshold, request or emit a full frame:

```ts
let errors = 0;

function onMessage(bytes: Uint8Array) {
  try {
    applyPatch(bytes);
    errors = 0;
  } catch {
    errors++;
    if (errors >= 3) requestFullSnapshot();
  }
}
```

See [Cookbook — Graceful Degradation](/guide/cookbook#graceful-degradation-stateless-fallback).

## Micro-batches in streams

For streams that send small groups of related records per tick:

```ts
enc.encodeMicroBatch([entity1, entity2, entity3]);
```

Useful when each tick carries a few same-shape objects rather than one large map.

## Framing

WebSocket messages map 1:1 to Twilic frames. For TCP or message queues, prepend a length prefix:

```text
[u32 length][twilic bytes]
```

See [Transport & Framing](/guide/transport-framing).

## Runnable example

```bash
git clone https://github.com/twilic/examples.git
cd examples
pnpm install
pnpm example:websocket:simulate   # size comparison
pnpm example:websocket            # live server + client
```

## Related

- [Stateful Decoding](/guide/stateful-decoding)
- [Session Encoder reference](/reference/session-encoder)
- [Real-Time Streaming article](/guide/articles/real-time-dashboards-and-streaming)
- [Spec — Transport Guide](/spec/transport)
