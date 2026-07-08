# API Reference

Complete API documentation for Twilic SDKs, integration packages, and tooling. Use this section when you need exact function signatures, types, and options — not just conceptual overviews.

## Packages

### JavaScript / TypeScript

| Package | Description |
| --- | --- |
| [`@twilic/core`](/reference/javascript-core) | Main entry: `init`, `encode`, `decode`, `createSessionEncoder` |
| [`@twilic/core/advanced`](/reference/javascript-advanced) | Batch, schema, transport-JSON, direct encoding, `AdvancedSessionEncoder` |

### Web integrations

| Package | Description |
| --- | --- |
| [Overview](/integrations/) | All HTTP client and server packages |
| [`@twilic/hono`](/integrations/hono) | Hono middleware and response helpers |
| [`@twilic/fetch`](/integrations/fetch) | `fetch` wrapper and response parsing |
| [`@twilic/express`](/integrations/express) | Express middleware |
| [`@twilic/fastify`](/integrations/fastify) | Fastify plugin and reply decorator |
| [`@twilic/axios`](/integrations/axios) | Axios instance with interceptors |

### Native SDKs

| Language | Reference                                                   |
| -------- | ----------------------------------------------------------- |
| Rust     | [`twilic-rust`](/reference/rust) — reference implementation |
| Python   | [`twilic-python`](/reference/python)                        |
| Go       | [`twilic-go`](/reference/go)                                |
| Java     | [`twilic-java`](/reference/java)                            |
| C        | [`twilic-c`](/reference/c)                                  |

Other language SDKs follow the same four-function surface (`encode`, `decode`, `encode_batch`, `create_session_encoder`). See [SDKs overview](/sdks/) for install instructions per language.

## Shared concepts

| Topic                      | Page                                            |
| -------------------------- | ----------------------------------------------- |
| Value types and Schema     | [Value & Schema](/reference/value-and-schema)   |
| SessionEncoder and options | [Session Encoder](/reference/session-encoder)   |
| Errors and decode limits   | [Errors & Limits](/reference/errors-and-limits) |

## Choosing an entrypoint

```text
One-shot encode/decode?
  → encode() / decode() from @twilic/core (or language equivalent)

Batch of same-shape records?
  → encodeBatch() from @twilic/core/advanced
  → encode_batch() in Rust / Python / Go

Schema-aware (Bound profile)?
  → encodeWithSchema() from @twilic/core/advanced

Long-lived stream with incremental updates?
  → createSessionEncoder() + encodePatch()

HTTP API?
  → Integration package + stateless Dynamic or Batch only

Debugging wire bytes?
  → Twilic CLI decode, or decodeToTransportJson() (advanced)
```

## Related

- [Encoding Profiles](/guide/encoding-profiles) — when to use Dynamic, Batch, Bound, Stateful
- [Cookbook](/guide/cookbook) — practical patterns
- [Specification](/spec/overview) — normative wire format
