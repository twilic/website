# Tools

Utilities for working with Twilic outside of application code.

## Developer tools

| Tool | Description |
| --- | --- |
| [Twilic CLI](/guide/cli) | Encode, decode, benchmark, and manage AI sessions from the terminal |
| [Twilic AI](/ai/) | Record, replay, and inspect LLM / agent runs as `.twai` sessions |
| [Playground](/guide/playground) | Compare encoded sizes in the browser |
| [Examples](/guide/examples) | Runnable projects — HTTP, WebSocket, telemetry, logs, cache |
| [Benchmark](/benchmark) | Throughput and size measurements |

## Documentation

| Resource | Description |
| --- | --- |
| [API Reference](/reference/) | SDK function signatures and types |
| [Integrations](/integrations/) | Hono, Express, Fastify, Fetch, Axios |
| [Twilic AI](/ai/) | `@twilic/ai` and adapters |
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

# Inspect a Twilic AI session
twilic ai inspect session.twai
```

Full CLI documentation: [Twilic CLI](/guide/cli).

Current tools use `@twilic/core`, which targets the v3 wire line. For the current specification, see [v3 Reference Profile](/spec/v3).
