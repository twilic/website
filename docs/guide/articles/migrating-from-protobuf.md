# Migrating from Protobuf

Teams adopt Protobuf for compact internal RPC and generated stubs. Twilic offers a different trade-off: **schema-less start**, self-describing payloads, and stronger wins on **lists and bulk data** — without abandoning schema when a hot path stabilizes.

This article covers when migration makes sense, side-by-side rollout patterns, and what you give up.

## When migration is worth it

| Your situation | Twilic fit |
| --- | --- |
| Bulk/list responses dominate bandwidth | Strong — Batch profile removes repeated field names |
| `.proto` files slow iteration on internal APIs | Strong — Dynamic profile, add Bound later |
| gRPC is org-mandatory with generated stubs everywhere | Weak — stay on Protobuf |
| Single-record hot paths with fixed schema | Mixed — Bound profile matches Protobuf density |
| External partner contracts on Protobuf | Do not migrate — keep Protobuf at the boundary |

See also [Internal APIs Without Protobuf Overhead](/guide/articles/internal-apis-without-protobuf-overhead) for the architecture case.

## What changes

| Aspect | Protobuf | Twilic |
| --- | --- | --- |
| Schema | Required `.proto` + codegen | Optional — Dynamic default |
| Wire | Field numbers, no field names | Self-describing or schema-bound |
| Lists | Repeated fields, key overhead per element | Batch interning — keys sent once |
| RPC transport | gRPC / HTTP/2 framing | HTTP + `application/vnd.twilic` or custom |
| Evolution | Field numbers, reserved tags | Dynamic maps tolerate new keys; Bound uses schema versioning |
| Tooling | protoc, buf, grpcurl | Twilic CLI, Playground |

Twilic is **not** a drop-in gRPC replacement. Plan transport separately — typically HTTP content negotiation or an internal binary channel.

## Migration phases

### Phase 0: Measure

Pick one read-heavy internal endpoint returning arrays (user list, order history, inventory page). Capture:

- JSON size (if dual-serving today)
- Protobuf serialized size
- Twilic Dynamic + Batch size on the same payload

Use [Playground](/guide/playground) or `pnpm example:api-response` in [examples](https://github.com/twilic/examples).

### Phase 1: Dual content type

Add Twilic alongside Protobuf on internal routes:

```http
GET /internal/users HTTP/1.1
Accept: application/vnd.twilic, application/x-protobuf
```

Server encodes based on `Accept`. Keep Protobuf as default until clients migrate.

With Hono:

```ts
import { twilicResponse } from "@twilic/hono";
import { encodeBatch } from "@twilic/core/advanced";

app.get("/internal/users", async (c) => {
  const users = await fetchUsers();
  if (c.req.header("accept")?.includes("application/vnd.twilic")) {
    return twilicResponse(c, users); // auto batch when appropriate
  }
  return c.protobuf(UserList.encode({ users }).finish());
});
```

### Phase 2: Client migration

Migrate internal consumers one service at a time:

1. Add `@twilic/fetch` or language SDK
2. Send `Accept: application/vnd.twilic`
3. Decode with `decode()` or `decodeBatch()`
4. Retire Protobuf client for that endpoint

No flag day — unmigrated clients keep Protobuf.

### Phase 3: Hot path Bound profile

When 2–3 message types stabilize (payments, fraud checks), promote to Bound:

```ts
import { encodeWithSchema } from "@twilic/core/advanced";
const bytes = encodeWithSchema(paymentSchema, event);
```

Density approaches Protobuf single-record size without `.proto` codegen — schema lives in application code or a shared JSON schema file.

### Phase 4: Retire Protobuf on internal routes

Once all internal clients on an endpoint support Twilic:

- Remove Protobuf encoder branch
- Keep Protobuf on north-south / partner APIs

## Mapping Protobuf concepts

| Protobuf               | Twilic equivalent                               |
| ---------------------- | ----------------------------------------------- |
| `message User { ... }` | Dynamic map or Bound `Schema`                   |
| `repeated User users`  | `encodeBatch(users)`                            |
| `oneof`                | Dynamic map with varying keys (no native oneof) |
| `map<K,V>`             | Twilic map value                                |
| `optional`             | Omit key or explicit null                       |
| Field numbers          | Bound schema field numbers                      |
| `bytes`                | Twilic `binary`                                 |
| Enum                   | Bound enum with declared values                 |
| gRPC streaming         | WebSocket + Stateful profile                    |

Protobuf `oneof` and deeply nested optional graphs map awkwardly to Dynamic mode — prefer Bound or flatten for hot paths.

## gRPC streaming replacement

For server-streaming RPC:

| Protobuf pattern                  | Twilic pattern              |
| --------------------------------- | --------------------------- |
| Unary RPC                         | HTTP + Dynamic/Batch        |
| Server streaming (full snapshots) | Batch chunks over HTTP/2    |
| Server streaming (incremental)    | WebSocket + `encodePatch()` |

See [Real-Time Dashboards and Streaming](/guide/articles/real-time-dashboards-and-streaming).

## Schema governance

Protobuf teams often use buf breaking-change detection. Twilic equivalents:

| Governance need          | Approach                                          |
| ------------------------ | ------------------------------------------------- |
| Breaking field removal   | Bound schema semver + CI decode tests             |
| New optional fields      | Dynamic mode — decoders ignore unknown keys       |
| Cross-team contract      | Shared schema JSON in monorepo or schema registry |
| Wire compatibility tests | [Conformance fixtures](/guide/conformance)        |

## Security during migration

- Treat Twilic bytes with same trust model as Protobuf — authenticated internal network only
- Apply payload size limits on decode
- Do not expose Twilic on public unauthenticated routes during pilot

## Rollback plan

Keep Protobuf encoder path until:

- All clients on the endpoint migrated
- One full release cycle with Twilic-only traffic monitored
- Rollback = revert `Accept` header handling (Protobuf path still deployed)

## When to keep Protobuf

- Platform mandate for gRPC everywhere
- External API contracts with third parties
- Heavy reliance on protoc plugins (validation, auth metadata)
- Embedded targets with existing nanopb/protoc-gen

## Next steps

- [Comparison — Twilic vs Protobuf](/guide/comparison#twilic-vs-protocol-buffers)
- [Schema-Bound Encoding](/guide/schema-bound)
- [Web Integrations](/guide/web-integrations)
- [Migrating from MessagePack](/guide/articles/migrating-from-messagepack) — similar dual-publish pattern
