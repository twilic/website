# Session Decoder

The session decoder maintains state required by Stateful Profile messages. Use it on the consumer side of an ordered channel (WebSocket, ordered queue, persistent RPC stream) to reconstruct full values from `STATE_PATCH` frames.

Session encoders and session decoders are separate objects. Their states stay aligned only by processing the same ordered byte sequence. On a bidirectional connection, outbound encode state and inbound decode state must remain independent.

## Creating a decoder

### JavaScript

```ts
import { createSessionDecoder, init } from "@twilic/core";

await init();

const dec = createSessionDecoder({
  maxBaseSnapshots: 8,
  unknownReferencePolicy: "statelessRetry",
});

const value = dec.decode(bytes);
dec.reset();
```

### Rust

```rust
use twilic::{create_session_decoder, SessionOptions};

let mut dec = create_session_decoder(SessionOptions::default());
let value = dec.decode(&bytes)?;
dec.reset();
```

`SessionOptions` are shared with [Session Encoder](/reference/session-encoder).

## API

```ts
class SessionDecoder {
  decode(bytes: Uint8Array): TwilicValue;
  reset(): void;
}
```

| Method | Description |
| --- | --- |
| `decode()` | Returns the application value for a full message, or the reconstructed value after applying a `STATE_PATCH` |
| `reset()` | Invalidates session-local snapshots, templates, dictionaries, and previous-message state |

Control messages such as `RESET_STATE` invalidate decoder state and are not returned as application values. If decoding fails, decoder state does not partially advance.

## WebSocket helper

Prefer [`createTwilicWebSocket({ stateful: true })`](/integrations/websocket) when you want per-connection encoder and decoder sessions without managing them by hand.

## Related

- [Session Encoder](/reference/session-encoder)
- [Stateful Decoding](/guide/stateful-decoding)
- [Stateful Streams](/guide/stateful-streams)
- [WebSocket](/integrations/websocket)
