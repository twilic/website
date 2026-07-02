# Playground

The [Twilic Playground](https://twilic.github.io/playground/) is a browser app for comparing encoded sizes without installing anything locally.

## What it shows

Two views are available:

1. **Encoded sizes** — the same fixture payloads as the [benchmark harness](/benchmark). Compares Twilic against MessagePack, CBOR, BSON, and JSON (UTF-8).
2. **Schema-first** — compares Twilic Bound profile (`encodeWithSchema`) with Protobuf, Avro, FlatBuffers, and Apache Arrow IPC on schema-example style records.

You can also paste custom JSON (a root object or array) to see how your own payload compares.

## When to use it

- Explore size savings on realistic fixtures before adopting Twilic.
- Compare schema-less and schema-first encoding side by side.
- Share a quick visual demo with teammates who do not have SDKs installed.

For throughput numbers (encode/decode ops per second), use the [benchmark harness](/benchmark) or [`twilic bench`](/guide/cli#run-benchmarks). The playground runs `@twilic/core` in WASM inside the browser; the benchmark suite uses Node.js N-API by default, so timing numbers are not directly comparable.

## Run locally

The playground depends on a sibling [`twilic-js`](https://github.com/twilic/twilic-js) checkout:

```text
your-workspace/
  twilic-js/
  twilic-rust/
  playground/
```

```bash
cd ../twilic-js
pnpm install
pnpm build:wasm
pnpm build:ts

cd ../playground
pnpm install
pnpm dev
```

Opens at `http://localhost:5173`.

## Source

[github.com/twilic/playground](https://github.com/twilic/playground)
