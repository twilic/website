# Transport & Framing

Twilic defines the binary payload format — not the transport protocol. This guide covers how to carry Twilic bytes over HTTP, WebSocket, TCP, and message queues.

## HTTP

### Content-Type

```http
Content-Type: application/vnd.twilic
Accept: application/vnd.twilic
```

All integration packages set this automatically.

### Request/response pattern

```http
POST /internal/events HTTP/1.1
Content-Type: application/vnd.twilic
Content-Length: 842

<binary twilic body>
```

Use **stateless** Dynamic or Batch profiles only. One request → one self-contained message (or batch).

### Content negotiation

Serve JSON and Twilic on the same route:

```ts
app.get("/users", async (req, res) => {
  const users = await getUsers();
  if (req.headers.accept?.includes("application/vnd.twilic")) {
    return twilicSend(res, encodeBatch(users));
  }
  return res.json(users);
});
```

### Size limits

Configure at reverse proxy (nginx, Cloudflare, API gateway):

```nginx
client_max_body_size 1m;
```

## WebSocket

One WebSocket message = one Twilic frame.

```ts
// Server
ws.send(enc.encodePatch(metrics));

// Client
ws.onmessage = (event) => {
  const bytes = new Uint8Array(event.data);
  applyPatch(bytes);
};
```

Use **Stateful** profile. Call `reset()` + full `encode()` after reconnect.

Binary frame type (`opcode 0x2`) — not text frames.

## TCP / custom protocols

Prepend a length prefix for stream framing:

```text
| u32 length (big-endian) | twilic payload |
```

```ts
function frameMessage(bytes: Uint8Array): Uint8Array {
  const header = new Uint8Array(4);
  new DataView(header.buffer).setUint32(0, bytes.length);
  const framed = new Uint8Array(4 + bytes.length);
  framed.set(header);
  framed.set(bytes, 4);
  return framed;
}
```

Readers loop: read 4 bytes → read N bytes → decode.

## Message queues (Kafka, SQS, NATS)

Each message body is a complete Twilic batch or single value:

```text
Topic: telemetry
Key: service-id
Value: <twilic col_batch bytes>
```

Recommendations:

- Batch at producer (256 events) before publish
- Use binary value encoding (not base64) when broker supports it
- Include format version byte if multiple formats coexist

## File storage

Archive Twilic batches to object storage for replay:

```text
s3://logs/2026/07/08/hour-12.batch.twl
```

Columnar batches compress further with ZSTD/LZ4 at rest.

## gRPC

Twilic is not native to gRPC (Protobuf is). Options:

1. **gRPC bytes field** — wrap Twilic payload in `bytes data = 1;`
2. **Side channel** — gRPC for control, WebSocket/TCP for Twilic data
3. **HTTP/2** with `@twilic/hono` on a parallel route

For greenfield internal RPC with strict Protobuf governance, consider gRPC natively. Use Twilic when schema-less flexibility matters.

## Profile × transport matrix

| Transport    | Dynamic | Batch | Bound | Stateful |
| ------------ | ------- | ----- | ----- | -------- |
| HTTP req/res | ✓       | ✓     | ✓     | ✗        |
| WebSocket    | ✓       | ✓     | ✓     | ✓        |
| TCP stream   | ✓       | ✓     | ✓     | ✓        |
| Kafka        | ○       | ✓     | ✓     | ✗        |
| File         | ○       | ✓     | ✓     | ✗        |

✓ recommended · ○ possible · ✗ inappropriate

## Related

- [Web Integrations](/integrations/)
- [Stateful Streams](/guide/stateful-streams)
- [Spec — Transport Guide](/spec/transport)
