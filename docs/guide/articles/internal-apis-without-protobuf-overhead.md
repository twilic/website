# Internal APIs Without Protobuf Overhead

Service-to-service APIs are the quiet bandwidth bill. Public REST endpoints stay on JSON for partners and browser clients. **Internal** calls — worker-to-worker, BFF-to-backend, sync jobs, bulk fetches — are where teams switch to MessagePack or gRPC+Protobuf to save bytes and parse time.

Twilic targets the MessagePack sweet spot: **no schema required on day one**, self-describing payloads, polyglot SDKs — with decisively smaller responses when services return lists, pages, or bulk records.

## The Internal API Dilemma

Platform teams face a recurring trade-off:

| Approach | Pros | Cons |
| --- | --- | --- |
| JSON | Debuggable, universal | Verbose on lists; slow parse at volume |
| MessagePack | Schema-less; easy adoption | Key overhead on every object in a batch |
| Protobuf + gRPC | Smallest single records; mature | `.proto` governance; poor ad-hoc maps |
| Twilic Dynamic/Batch | Schema-less; smaller batches | Binary; newer ecosystem |

Frameworks like MagicOnion demonstrate the MessagePack path: C# interfaces define the API, MessagePack serializes arguments and results on HTTP/2, teams skip `.proto` files. The gap appears when those results are **arrays of objects** — user lists, ledger entries, inventory rows.

## Where Twilic Wins

### Paginated list endpoints

A internal `GET /internal/users?page=3` returning 50 records × 8 fields:

- JSON sends 50 × 8 field names
- MessagePack sends 50 × 8 field names (compact encoding, but still repeated keys)
- Twilic Batch sends field names **once** + interned repeated strings

Typical reduction: **40–60% vs JSON**, **30–50% vs MessagePack** on multi-record responses.

See [Examples — API response](https://github.com/twilic/examples) for a runnable Hono server with size comparison.

### Bulk RPC and job payloads

Data export, reconciliation, and ETL jobs often move thousands of same-shaped records in one call. Row batch (`encodeBatch`) or columnar batch (`col_batch`) matches the workload:

- **Row batch**: nested objects, moderate field count
- **Columnar batch**: tabular data, many rows, numeric columns

### Gradual schema adoption

When a hot path stabilizes — payments, fraud checks, entitlement updates — promote to **Bound Profile** without changing transport:

```text
Phase 1: Dynamic on all internal routes
Phase 2: Batch on list/bulk endpoints
Phase 3: Bound on 2–3 fixed-message hot paths
```

Protobuf forces phase 3 from day one. Twilic lets you earn it.

## Integration Patterns

### HTTP content negotiation

Serve Twilic on internal routes with a dedicated media type; keep JSON on public routes.

```http
GET /internal/orders HTTP/1.1
Accept: application/vnd.twilic
```

The [`@twilic/hono`](https://github.com/twilic/hono) and [`@twilic/fetch`](https://github.com/twilic/fetch) packages handle negotiation and decoding.

### gRPC-like streams without Protobuf

For long-lived HTTP/2 or WebSocket streams between services, pair **Stateful Profile** with internal APIs when updates are incremental. See [Real-Time Dashboards and Streaming](/guide/articles/real-time-dashboards-and-streaming).

### Polyglot microservices

Twilic interoperability: a Rust producer and Go consumer exchange bytes without a shared schema file in Dynamic mode. Platform standards can mandate:

- `Content-Type: application/vnd.twilic` on internal east-west traffic
- Batch encoding for any response with ≥ N same-shape records
- JSON only at the north-south edge

## Security Boundaries

Internal APIs are not automatically trusted:

- **Service mesh identity** proves caller, not payload safety
- **Deserialization** of bytes from a compromised peer is still an attack surface

Apply:

- Maximum payload size limits
- Reject typeless or dynamic map keys from untrusted peers where your SDK supports strict mode
- Keep **public** and **partner** APIs on JSON or governed Protobuf

Twilic belongs **behind** authentication and network policy — same as MessagePack.

## Migration from JSON Internal APIs

A low-risk rollout:

1. Add Twilic encoder alongside existing JSON serializer
2. Dual-publish `Accept` header support on one read-heavy endpoint
3. Migrate internal clients one by one
4. Measure bandwidth on service mesh metrics or load balancer logs
5. Enable batch encoding when all clients on an endpoint support it

No flag day. JSON clients continue working until retired.

## When to Use Protobuf Instead

Choose Protobuf + gRPC when:

- gRPC is already org-standard
- A single `.proto` is owned by a platform team with semver discipline
- You need generated stubs in many languages and maximum single-record density
- Long-lived external contracts cross company boundaries

Choose Twilic when:

- Teams need schema-less flexibility and faster iteration
- Bulk/list payloads dominate bandwidth
- You want to start without codegen and add schema later

## Next Steps

- [Migrating from Protobuf](/guide/articles/migrating-from-protobuf)
- [Web Integrations](/guide/web-integrations)
- [Cookbook — API Response](/guide/cookbook#api-response-with-repeated-structure)
- [Comparison — Twilic vs Protobuf](/guide/comparison#twilic-vs-protocol-buffers)
- [Business Use Cases — Internal APIs](/guide/business-use-cases#internal-apis-and-microservices)
