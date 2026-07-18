# Business Use Cases

Twilic is built for the workloads where teams already reach for MessagePack, Protocol Buffers, or compact JSON — and where repeated structure, volume, or session reuse makes wire size a real cost center.

This page maps proven industry adoption patterns to Twilic. Each scenario below is grounded in how organizations actually use binary serialization today: internal services, observability pipelines, distributed caches, real-time dashboards, and mobile or game backends. Twilic keeps the schema-less ergonomics of MessagePack while going further on the workloads where key repetition dominates.

## Who Twilic Is For

Twilic fits teams that:

- Move large volumes of structured data between services, agents, or clients
- Already use JSON or MessagePack internally and want smaller payloads without a `.proto` migration
- Run long-lived streams where most fields stay stable between updates
- Batch records with the same shape — API lists, telemetry events, log records, cache entries
- Operate across multiple languages and want a self-describing wire format

Twilic is **not** a replacement for human-readable public APIs, audit trails, or strict cross-team schema governance. For those boundaries, JSON or Protobuf remain the better default. See [Comparison](/guide/comparison) for an honest format decision guide.

## Use Case Overview

| Scenario | Typical pain today | Why teams adopt binary formats | Twilic advantage |
| --- | --- | --- | --- |
| [Distributed caching](#distributed-caching) | Redis/Memcached memory bills, eviction pressure | Smaller values → more hits, lower RAM | Shape + string interning on repeated cache objects |
| [Telemetry & event pipelines](#telemetry-and-event-pipelines) | Agent CPU, egress bandwidth, queue depth | Compact records at high frequency | Columnar batch + per-column codecs |
| [Internal APIs & microservices](#internal-apis-and-microservices) | Service-to-service bandwidth, parse cost | Binary over HTTP/gRPC without public readability needs | Batch responses, no schema required on day one |
| [Real-time dashboards & streaming](#real-time-dashboards-and-streaming) | WebSocket bandwidth, mobile data caps | Full snapshots every tick are wasteful | Stateful patches send only changed fields |
| [Mobile, game & edge clients](#mobile-game-and-edge-clients) | Payload size, battery, GC pressure | Smaller wire = less I/O and allocation | Typed vectors + batch on homogeneous game/IoT data |
| [Multi-language platforms](#multi-language-platforms) | Heterogeneous stacks (Go + Python + JS + .NET) | Self-describing format avoids codegen lock-in | Same Dynamic profile across 18+ SDKs |

## Distributed Caching

### The business problem

Object caches are a direct infrastructure line item. When cache values are JSON or MessagePack maps with verbose field names, every stored object pays the same key overhead again and again. At scale, that translates to:

- Higher Redis or Memcached memory usage and earlier eviction
- More replicas to hold the same working set
- Slower warm-up after deploys or failover

Real-world MessagePack adoptions in this space — including large e-commerce and ad-tech platforms — report **15–50% memory reduction** after moving from text or legacy serialization to compact binary formats, often without changing application semantics.

### How Twilic helps

Cache entries usually share a stable shape: the same field names, repeated enum-like strings (`"active"`, `"USD"`, region codes), and numeric IDs. MessagePack still repeats those keys in every value. Twilic interns shape and strings within a message, so a page of 50 user objects or 200 ad-bid records costs far less per entry.

**Recommended profile:** Dynamic (stateless) for single cache values; Batch for bulk warm-up or snapshot export.

**Related reading:**

- [Cut Infrastructure Costs with Safer Caching](/guide/articles/cut-infrastructure-costs-with-safer-caching)
- [Cookbook — API Response with Repeated Structure](/guide/cookbook#api-response-with-repeated-structure)
- [Examples — Cache payload](https://github.com/twilic/examples)

## Telemetry and Event Pipelines

### The business problem

Observability agents, log forwarders, and analytics collectors process **millions of small, same-shaped records per minute**. In this category, Fluent Bit uses MessagePack as an internal representation precisely because text JSON is too large and too slow to parse at volume.

The cost shows up as:

- Agent CPU and memory on every node
- Egress charges from edge to aggregation tier
- Kafka or queue storage retention bills
- Backpressure during traffic spikes

### How Twilic helps

Telemetry workloads are Twilic's strongest fit. Events in a batch share columns: `timestamp`, `service`, `level`, `trace_id`, `duration_ms`. Twilic's `col_batch` mode compresses each column independently — delta bitpack on timestamps, RLE on log levels, dictionary encoding on service names.

On representative 256-event batches, Twilic is often **5–8× smaller than MessagePack** and an order of magnitude smaller than JSON. That compounds directly into lower storage and network cost.

**Recommended profile:** Batch with `col_batch` for pipeline stages; Dynamic for single-event edge cases.

**Related reading:**

- [Telemetry and Event Pipelines at Scale](/guide/articles/telemetry-and-event-pipelines-at-scale)
- [Cookbook — Telemetry Pipeline](/guide/cookbook#telemetry-pipeline)
- [Examples — Telemetry](https://github.com/twilic/examples)

## Internal APIs and Microservices

### The business problem

Public REST APIs stay on JSON for debuggability and partner compatibility. **Internal** service boundaries are different: payloads are machine-generated, volume is high, and engineers rarely `curl` raw responses in production.

Teams often choose MessagePack here because it needs no schema file and drops into existing JSON-shaped code. MagicOnion and similar frameworks use MessagePack on gRPC/HTTP2 for exactly this reason — typed interfaces in code, compact wire format underneath.

The remaining gap: list endpoints and bulk RPC calls still repeat field names in every object. At 1,000 records per response, that overhead is measurable in bandwidth and parse time.

### How Twilic helps

Twilic Dynamic is intentionally MessagePack-compatible in data model. You can adopt it on internal routes without a schema migration:

1. Start with stateless Dynamic on high-volume list endpoints
2. Add `encodeBatch` when responses return many same-shape records
3. Introduce Bound Profile only on hot paths where schema is already stable

No `.proto` contract, no code generation step — but decisively smaller on the workloads internal APIs actually send.

**Recommended profile:** Dynamic for single objects; Batch for list/bulk endpoints; Bound for fixed payment or transaction messages.

**Related reading:**

- [Internal APIs Without Protobuf Overhead](/guide/articles/internal-apis-without-protobuf-overhead)
- [Examples — API response](https://github.com/twilic/examples)
- [Web Integrations](/guide/web-integrations)

## Real-Time Dashboards and Streaming

### The business problem

Live dashboards, trading UIs, game state sync, and IoT control planes maintain **long-lived connections**. Each tick often carries a full metric object even when only two or three fields changed. MessagePack shrinks each snapshot, but it cannot express "only these fields changed since last frame."

### How Twilic helps

Twilic's Stateful Profile tracks the last encoded object and emits patches when field values change. On a 15-field dashboard metric where 2 fields update per tick, payloads can drop from ~250 bytes (MessagePack full object) to **~30–50 bytes** (state patch).

Sessions are explicit and recoverable: reset on disconnect, send a full frame, resume patching. Receivers that do not implement stateful mode can still decode the first full frame as a normal Dynamic message.

**Recommended profile:** Stateful (`SessionEncoder` / `encodePatch`).

**Related reading:**

- [Real-Time Dashboards and Streaming](/guide/articles/real-time-dashboards-and-streaming)
- [Cookbook — WebSocket Streaming](/guide/cookbook#websocket-streaming-live-dashboard)
- [Examples — WebSocket session](https://github.com/twilic/examples)

## Mobile, Game, and Edge Clients

### The business problem

Mobile apps, Unity clients, and edge workers pay for every byte twice: download time and battery on the device, plus origin egress on the server. Game studios and cross-platform teams already use MessagePack between Unity/C# and Java or Go backends for this reason.

Homogeneous data — coordinate arrays, sensor samples, animation keyframes — still wastes space when each number is encoded as an independent tagged value.

### How Twilic helps

- **Batch API responses** shrink paginated game inventory or leaderboards
- **Typed vectors** with XOR/delta codecs compress dense `f64` or `i32` arrays (1,000 samples often **4–6× smaller than MessagePack**)
- **Stateful sync** reduces tick traffic for entity state that changes incrementally

Twilic SDKs cover Rust, Go, C#, Swift, Kotlin, Dart, and JavaScript — the typical game and mobile stack.

**Recommended profile:** Batch for lists; typed vectors for sensor/physics arrays; Stateful for live entity sync.

**Related reading:**

- [Examples — Batch records](https://github.com/twilic/examples)
- [Cookbook — Sensor Data](/guide/cookbook#sensor-data-dense-numeric-arrays)

## Multi-Language Platforms

### The business problem

Platform teams support polyglot microservices: Go workers, Python ML pipelines, Node BFFs, Java payment services. Schema-first formats centralize contracts but slow down teams that need ad-hoc maps and gradual rollout.

MessagePack wins here because it is self-describing and widely implemented. The trade-off is size on repeated structure.

### How Twilic helps

Twilic interoperability requires both sides to agree on version and profile. The published SDK line provides v2 cross-language fixtures today; v3 Dynamic still keeps the no-shared-schema adoption path where tags are unchanged. Platform teams can:

- Standardize on `application/vnd.twilic` for internal event buses
- Roll out SDK-by-SDK without a big-bang migration
- Add Bound Profile on individual services when schemas stabilize

See [Cookbook — Multi-Language Interoperability](/guide/cookbook#multi-language-interoperability).

## Adoption Path

Most production rollouts follow the same sequence MessagePack adopters use — with an extra compression tier once volume proves the ROI.

```text
1. Identify an internal boundary (cache, pipeline, internal API, WebSocket)
2. Benchmark real production payloads vs JSON and MessagePack
3. Pilot Twilic Dynamic on one producer/consumer pair
4. Enable Batch or Stateful where repetition or streams dominate
5. Document key strategy, size limits, and untrusted-input policy
6. Expand to adjacent services with the same shape patterns
```

For teams already on MessagePack, see [Migrating from MessagePack](/guide/articles/migrating-from-messagepack).

For ROI framing and stakeholder checklists, see [Building the Adoption Business Case](/guide/articles/building-the-adoption-business-case).

## When Not to Use Twilic

Stay on JSON or another format when:

- **Humans must read payloads in production** — support tickets, audit, partner debugging
- **A strict long-lived public contract exists** — Protobuf + gRPC may be simpler to govern
- **Payloads are one-off and non-repeating** — MessagePack or JSON is adequate; Twilic adds little
- **Untrusted input is deserialized without size limits or type allowlists** — any binary format needs boundary discipline

Twilic is an optimization for **internal, high-volume, repetitive structure** — not a universal replacement.

## Next Steps

- [Articles](/guide/articles/) — deeper scenarios, migration guides, and business case templates
- [Benchmark](/benchmark) — throughput and size measurements on representative workloads
- [Examples](https://github.com/twilic/examples) — runnable projects with size comparisons
- [Quick Start](/guide/quick-start) — encode your first payload in minutes
