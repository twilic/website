# Cut Infrastructure Costs with Safer Caching

Distributed object caches are one of the clearest ROI paths for compact binary serialization. The business case is simple: **smaller values mean more data in the same RAM**, fewer replicas, and less eviction under load.

Teams at Shopify, MicroAd, and Gunosy adopted MessagePack for cache payloads for exactly this reason — reporting **15–50% memory reduction** compared to JSON or legacy Ruby serialization, without changing what applications store logically.

Twilic targets the same workloads with an additional advantage: cache entries almost always share shape and repeated strings, which MessagePack still encodes redundantly.

## Why Caches Are Expensive at Scale

A typical cached object is a map with 6–20 fields: IDs, timestamps, status strings, nested associations, and enum-like categories. In JSON or MessagePack:

- Field names are repeated in **every** cached value
- Common strings (`"active"`, `"USD"`, region codes) are stored verbatim each time
- Numeric IDs that fit in 4–8 bytes may cost more as text

Multiply that by millions of keys and the waste is not theoretical. It shows up as:

| Symptom | Business impact |
| --- | --- |
| High Redis memory utilization | Larger instance tiers or more shards |
| Frequent eviction | Cache miss → database load → latency SLO risk |
| Long warm-up after deploy | Cold start pain, thundering herd |
| Replication bandwidth | Cross-AZ data transfer charges |

## What Production Teams Already Proved with MessagePack

MessagePack adoptions in caching share a consistent pattern:

1. **Evaluate** gzip, Protocol Buffers, and MessagePack on real payloads
2. **Reject** gzip when decompression latency breaks real-time paths
3. **Reject** Protobuf when schema rigidity slows iteration on cache shape
4. **Choose** MessagePack for JSON-like flexibility with smaller wire size
5. **Invest** in extension types, version bytes, and parallel migration for safety

Shopify ran a **six-month parallel migration**: new values encoded as MessagePack, failures fell back to the legacy format, and encode failures were logged to discover missing extension types. MicroAd chose MessagePack over gzip and Protobuf because column changes were frequent and Redis capacity was the bottleneck.

Twilic fits **step 4 and beyond** — same flexibility, better compression on repeated structure.

## Where Twilic Goes Further

MessagePack removes JSON's text overhead but **still sends field names in every map**. Twilic interns shape and strings within a message:

| Workload | MessagePack | Twilic |
| --- | --- | --- |
| Single cache entry | ~baseline | ~baseline (first occurrence) |
| Bulk warm-up (500 same-shape objects) | 100% | ~30–40% |
| Snapshot export with repeated status strings | 100% | ~25–35% |

For a Redis deployment storing hundreds of millions of same-shaped objects, that gap is directly translatable to **RAM saved or headroom gained**.

### Example: user session cache

A session object with 10 fields, cached per active user:

```json
{
  "user_id": 9001,
  "plan": "pro",
  "region": "us-east",
  "role": "admin",
  "active": true,
  "last_seen_ms": 1700000000000,
  "features": ["analytics", "sso"],
  "locale": "en-US"
}
```

Across 100,000 active sessions, `"plan"`, `"region"`, `"role"`, and `"locale"` repeat heavily. Twilic string interning and shape definition mean those field names and common values are not re-sent per entry in a batch snapshot.

For single-key `SET`/`GET` patterns, use **Dynamic (stateless)** — comparable to MessagePack on one value, better when you batch writes during warm-up or replication.

## Safer Migration Strategy

Borrow the parallel migration playbook proven at scale:

### 1. Version prefix

Prefix payloads with a one-byte format version. Decoders branch on version and support legacy + Twilic paths during rollout.

### 2. Dual-write or read-fallback

- **Dual-write**: new writes go to Twilic; reads try Twilic then legacy
- **Read-fallback**: encode failures log the object type and fall back to legacy format

### 3. Measure before cutover

Benchmark **your** payloads:

```bash
git clone https://github.com/twilic/examples.git
cd examples
pnpm install
pnpm example:cache-payload
```

Compare byte counts on objects sampled from production — not synthetic micro-benchmarks.

### 4. Monitor eviction and memory

Track:

- `used_memory` / `maxmemory` ratio
- Evicted keys per second
- P99 cache miss latency downstream

A successful migration shows memory headroom or fewer evictions **before** you reduce instance size.

### 5. Untrusted input discipline

Cache values are usually application-generated (trusted). If any cache key can be influenced by external users, apply the same rules as any binary format:

- Size limits on decode
- No typeless deserialization of untrusted bytes
- Allowlist expected shapes at the application layer

## When to Stay on MessagePack

Twilic's advantage is smallest on **single, heterogeneous cache entries** with no batching path. If your cache values are mostly one-off blobs and memory is not a top constraint, MessagePack may be sufficient.

Also keep **human-inspectable** diagnostic caches on JSON if engineers routinely read raw values in incidents.

## Recommended Twilic Profile

| Pattern | Profile |
| --- | --- |
| `SET` / `GET` single object | Dynamic (stateless) |
| Pipeline warm-up, snapshot dump, replication bulk | Batch with shape interning |
| Fixed payment or entitlement struct | Bound (optional, when schema is stable) |

## Next Steps

- [Enterprise Use Cases — Distributed Caching](/guide/enterprise-use-cases#distributed-caching)
- [Examples — Cache payload](https://github.com/twilic/examples)
- [Migrating from MessagePack](/guide/articles/migrating-from-messagepack)
- [Building the Adoption Business Case](/guide/articles/building-the-adoption-business-case)
