# Tools

Utilities for working with Twilic outside of application code.

## Developer tools

| Tool | Description |
| --- | --- |
| [Twilic CLI](/guide/cli) | Encode, decode, and benchmark from the terminal |
| [Playground](/guide/playground) | Compare encoded sizes in the browser |
| [Examples](/guide/examples) | Runnable projects — HTTP, WebSocket, telemetry, logs, cache |
| [Benchmark](/benchmark) | Throughput and size measurements |

## Documentation

| Resource | Description |
| --- | --- |
| [API Reference](/reference/) | SDK function signatures and types |
| [Integrations](/integrations/) | Hono, Express, Fastify, Fetch, Axios |
| [Troubleshooting](/guide/troubleshooting) | Common errors and fixes |
| [Glossary](/guide/glossary) | Term definitions |

## CLI quick reference

```bash
# Encode JSON → Twilic
echo '{"a":1}' | twilic encode

# Decode Twilic → JSON
cat data.twilic | twilic decode --pretty

# Benchmark vs MessagePack, CBOR, BSON, JSON
twilic bench --backend napi
```

Full CLI documentation: [Twilic CLI](/guide/cli).

All tools target the [v2 wire format](/spec/overview) and use `@twilic/core` or language SDKs built on the Rust reference implementation.
