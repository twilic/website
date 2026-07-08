# Real-Time Dashboards and Streaming

Live dashboards, operational consoles, trading monitors, and game state sync share one constraint: **connections stay open**, and **most fields do not change every tick**.

Sending a full JSON or MessagePack object on every update works — until you multiply by thousands of concurrent clients, mobile data plans, and cross-region egress. That is when teams look for incremental encodings.

Twilic's Stateful Profile is built for this: the first frame is a full message; subsequent frames send **only changed fields**.

## The Streaming Waste Problem

Consider a server metrics object with 15 fields, pushed 20 times per second per dashboard:

```json
{
  "cpu_pct": 42.1,
  "mem_mb": 8192,
  "disk_read_bps": 1048576,
  "disk_write_bps": 524288,
  "net_in_bps": 2048000,
  "net_out_bps": 1536000,
  "req_per_sec": 1240,
  "error_rate": 0.002,
  "p99_ms": 45,
  "active_connections": 3821,
  "queue_depth": 12,
  "region": "us-east-1",
  "host": "api-7",
  "version": "2.14.0",
  "uptime_sec": 864000
}
```

On most ticks, only `cpu_pct`, `req_per_sec`, and `queue_depth` change. The other 12 fields are identical — but MessagePack and JSON resend them all.

| Encoding                  | Per-tick size (typical) |
| ------------------------- | ----------------------- |
| JSON (full object)        | ~400 bytes              |
| MessagePack (full object) | ~250 bytes              |
| Twilic state patch        | ~30–50 bytes            |

At 20 ticks/sec × 5,000 dashboards, the difference between MessagePack and Twilic patches is **tens of megabytes per second** of egress.

## How Stateful Twilic Works

1. **Session encoder** tracks the last encoded map
2. **First `encode()`** sends a complete Dynamic message (establish baseline)
3. **`encodePatch()`** on subsequent ticks sends only keys whose values changed
4. **`reset()`** on disconnect or decode error — next frame is full again

Receivers maintain a matching session decoder to apply patches. If a client does not implement stateful mode, it can still decode the initial full frame as a normal stateless message.

### WebSocket example flow

```text
Client connects
  ← full frame (all 15 fields)
  ← patch (2 fields)
  ← patch (3 fields)
  ← patch (1 field)
Connection drops
Client reconnects
  ← full frame (reset + baseline)
  ← patch ...
```

See [Cookbook — WebSocket Streaming](/guide/cookbook#websocket-streaming-live-dashboard) and [Examples — WebSocket session](https://github.com/twilic/examples).

## Production Patterns

### Graceful degradation

Network glitches and version skew cause patch decode failures. Production code should:

- Count consecutive decode errors
- Call `reset()` after a threshold
- Emit a full frame before resuming patches

See [Cookbook — Graceful Degradation](/guide/cookbook#graceful-degradation-stateless-fallback).

### Mobile and edge clients

Stateful compression directly reduces:

- Cellular data usage for field technician apps
- Battery from radio-on time
- CDN egress for browser dashboards using WebSockets

Pair with batch encoding for initial snapshot + stateful patches for updates.

### Game and simulation sync

Entity state with many static attributes (type, owner, spawn zone) and few dynamic attributes (position, health) maps cleanly to patches. Unity/C#/JavaScript clients can use official Twilic SDKs alongside server-side Go or Rust simulators.

## When Stateful Mode Is Not Appropriate

Skip stateful encoding when:

- **Messages are independent** — event feeds where every message is unrelated
- **UDP or unordered delivery** — patches assume ordered application of frames
- **Short-lived connections** — overhead of session state outweighs savings
- **Most fields change every tick** — patch size approaches full object size

For independent events, use **Batch** or **columnar** modes instead.

## Observability

Binary patches are opaque in browser devtools. For operations:

- Log patch field counts and byte sizes at sample rate
- Expose a debug endpoint that returns the latest full object as JSON
- Alert on elevated `reset()` rate (signals client/server state drift)

## Pilot Metrics

Track during a two-week pilot on one dashboard product:

| Metric                          | Target signal                     |
| ------------------------------- | --------------------------------- |
| Avg bytes per WebSocket message | ↓ 70–90% vs MessagePack           |
| Egress $ on streaming tier      | ↓ proportional to byte reduction  |
| P99 tick latency                | Neutral or improved (less I/O)    |
| Client CPU                      | Neutral (patch apply is cheap)    |
| Reconnect storm behavior        | Full frame recovery within 1 tick |

## Next Steps

- [Cookbook — WebSocket Streaming](/guide/cookbook#websocket-streaming-live-dashboard)
- [Examples — WebSocket session](https://github.com/twilic/examples)
- [Business Use Cases — Real-Time Dashboards](/guide/business-use-cases#real-time-dashboards-and-streaming)
- [Spec — Stateful optimization](/spec/profiles)
