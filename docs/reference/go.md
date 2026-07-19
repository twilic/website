# Go API Reference

Go implementation of Twilic v3 with full session, batch, bound-stream, and low-level codec support.

**Module:** `github.com/twilic/twilic-go`  
**Source:** [github.com/twilic/twilic-go](https://github.com/twilic/twilic-go)

## Install

```bash
go get github.com/twilic/twilic-go
```

## High-level API

```go
import twilic "github.com/twilic/twilic-go"

// Stateless dynamic
bytes, err := twilic.Encode(value)
restored, err := twilic.Decode(bytes)

// Batch
bytes, err := twilic.EncodeBatch(records)

// v3 schema batch / bound stream
batch, err := twilic.EncodeBatchWithSchema(schema, records)
stream, err := twilic.EncodeBoundStream(schema, records)

// Session
enc := twilic.NewSessionEncoder(twilic.SessionOptions{})
frame, err := enc.Encode(value)
patch, err := enc.EncodePatch(updated)
enc.Reset()
```

## Building values

```go
value := twilic.NewMap(
    twilic.Entry("id", twilic.NewU64(1001)),
    twilic.Entry("name", twilic.NewString("alice")),
    twilic.Entry("scores", twilic.NewArray(
        twilic.NewI64(12),
        twilic.NewI64(15),
    )),
)
```

| Constructor               | Type      |
| ------------------------- | --------- |
| `NewNull()`               | null      |
| `NewBool(v)`              | bool      |
| `NewI64(v)` / `NewU64(v)` | integer   |
| `NewF64(v)`               | float64   |
| `NewString(v)`            | string    |
| `NewBinary(v)`            | []byte    |
| `NewArray(...)`           | slice     |
| `NewMap(...)`             | map       |
| `Entry(key, value)`       | map entry |

## SessionEncoder

```go
enc := twilic.NewSessionEncoder(twilic.SessionOptions{
    MaxBaseSnapshots:       8,
    EnableStatePatch:       true,
    EnableTemplateBatch:    true,
    EnableTrainedDictionary: true,
    UnknownReferencePolicy: twilic.UnknownReferencePolicyFailFast,
})

enc.Encode(value)
enc.EncodePatch(updated)
enc.EncodeBatch(records)
enc.EncodeMicroBatch(records)
enc.Reset()
```

## SessionOptions

```go
type SessionOptions struct {
    MaxBaseSnapshots        int
    EnableStatePatch        bool
    EnableTemplateBatch     bool
    EnableTrainedDictionary bool
    UnknownReferencePolicy  UnknownReferencePolicy
}
```

## TwilicCodec (low-level)

```go
codec := twilic.NewTwilicCodec()
bytes, err := codec.EncodeValue(value)
msg, err := codec.DecodeMessage(bytes)
```

`TwilicCodecWithOptions` accepts custom `SessionOptions` for stateful low-level encoding.

## KeyRef literals

Go supports explicit key references for hot paths:

```go
twilic.KeyRefLiteral("field_name")
```

## Message model

Full `Message` type with kinds matching the Rust reference: `MessageKindScalar`, `MessageKindColumnBatch`, `MessageKindStatePatch`, `MessageKindTemplateBatch`, and others.

## Errors

```go
type TwilicError struct { Kind TwilicErrorKind; /* ... */ }
```

Handle `TwilicErrorKindStatelessRetryRequired` for client recovery flows.

## WebSocket example

```go
enc := twilic.NewSessionEncoder(twilic.SessionOptions{})

for tick := range metricsChannel {
    bytes, err := enc.Encode(twilic.NewMap(/* ... */))
    if err != nil {
        enc.Reset()
        continue
    }
    conn.WriteMessage(websocket.BinaryMessage, bytes)
}
```

See [Cookbook — WebSocket Streaming](/guide/cookbook#websocket-streaming-live-dashboard).

## Related

- [Rust API](/reference/rust)
- [Python API](/reference/python)
- [Stateful Streams](/guide/stateful-streams)
