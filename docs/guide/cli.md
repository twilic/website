# Twilic CLI

Command-line tool for encoding JSON to Twilic, decoding Twilic to JSON, benchmarking against other binary formats, and working with [Twilic AI](/ai/) sessions.

**Package:** `@twilic/cli`  
**Source:** [github.com/twilic/cli](https://github.com/twilic/cli)

## Install

```bash
pnpm add -g @twilic/cli @twilic/core
```

For AI session commands, also install the optional peer:

```bash
pnpm add -g @twilic/cli @twilic/core @twilic/ai
```

Or run without installing:

```bash
pnpx @twilic/cli encode --help
```

Requires `@twilic/core` as a runtime dependency for the encode/decode backend. `@twilic/ai` is required only for `twilic ai …` subcommands.

---

## `encode`

Encode JSON to Twilic binary format.

```bash
# From stdin
echo '{"hello":"world","n":42}' | twilic encode

# From file
twilic encode -i data.json -o data.twilic

# Hex output (debugging)
echo '{"hello":"world"}' | twilic encode --hex
```

### Options

| Flag                  | Description                             |
| --------------------- | --------------------------------------- |
| `-i, --input <file>`  | Input JSON file (default: stdin)        |
| `-o, --output <file>` | Output file (default: stdout)           |
| `--hex`               | Output hex string instead of raw binary |

### Examples

```bash
# Roundtrip test
echo '{"users":[{"id":1,"name":"alice"}]}' | twilic encode | twilic decode --pretty

# Encode fixture for interop test
twilic encode -i fixture.json -o fixture.twilic
```

---

## `decode`

Decode Twilic binary to JSON.

```bash
# From stdin
cat data.twilic | twilic decode

# Pretty-print
twilic decode -i data.twilic --pretty

# From hex string (when piping --hex output)
echo "a1..." | twilic decode
```

### Options

| Flag                  | Description                        |
| --------------------- | ---------------------------------- |
| `-i, --input <file>`  | Input binary file (default: stdin) |
| `-o, --output <file>` | Output file (default: stdout)      |
| `--pretty`            | Pretty-print JSON output           |

### BigInt serialization

Twilic encodes integers as 64-bit values. The CLI serializes decoded `bigint` values as **JSON strings** to preserve precision:

```json
{ "id": "9007199254740993" }
```

---

## `bench`

Benchmark Twilic encoding and decoding against MessagePack, CBOR, BSON, and JSON.

```bash
# Default benchmark
twilic bench

# WASM backend, longer run
twilic bench --backend wasm --time-ms 2000

# Save results as Markdown
twilic bench --markdown-out results.md
```

### Options

| Flag                     | Description                         |
| ------------------------ | ----------------------------------- |
| `--backend <napi\|wasm>` | Backend (default: `napi`)           |
| `--time-ms <ms>`         | Time per task in ms (default: 1000) |
| `--warmup-ms <ms>`       | Warmup time in ms (default: 250)    |
| `--markdown-out <file>`  | Append results as Markdown          |

### Benchmark modes

The [benchmark repository](https://github.com/twilic/benchmark) supports additional modes not exposed in the CLI wrapper:

- Single-record encode/decode
- Batch encode (256 records)
- Transport-JSON fast path
- Stateful patch simulation

See [Performance guide](/guide/performance) and [Benchmark page](/benchmark).

---

## `ai`

Inspect, replay, convert, and record [Twilic AI](/ai/) sessions. Requires `@twilic/ai`.

```bash
# Inspect a JSONL fixture or .twai file
twilic ai inspect session.twai

# Create a .twai file from JSONL, then inspect it
twilic ai record --input events.jsonl -o session.twai
twilic ai inspect session.twai

# Replay events (realtime timing with --speed)
twilic ai replay session.twai --speed 10

# Convert to JSON or JSONL
twilic ai convert session.twai --to jsonl -o session.jsonl

# Diff two sessions
twilic ai diff before.twai after.twai

# Compare encoding sizes for fixtures in a directory
twilic ai benchmark ./fixtures
```

### Subcommands

| Command | Description |
| --- | --- |
| `inspect <file>` | Print session summary (`--json` for JSON output) |
| `replay <file>` | Print events in order (`--json`, `--speed <n>`) |
| `diff <before> <after>` | Compare two sessions (`--json`) |
| `convert <file> --to json\|jsonl` | Convert session format (`-o` output file) |
| `record` | Write `.twai` from JSONL stdin or `--input` (`-o` output, default `run.twai`) |
| `benchmark [fixtures-dir]` | Compare JSON vs `.twai` sizes for `.jsonl` fixtures |

Accepted input formats for inspect / replay / convert / diff: `.twai`, `.jsonl`, or `.json`.

See [Twilic AI](/ai/) for packages, adapters, and the `.twai` format.

---

## Scripting patterns

### CI size regression

```bash
#!/bin/bash
SIZE=$(echo "$FIXTURE" | twilic encode | wc -c)
if [ "$SIZE" -gt "$MAX_BYTES" ]; then
  echo "Payload too large: $SIZE > $MAX_BYTES"
  exit 1
fi
```

### Inspect production payload

```bash
curl -s -H "Accept: application/vnd.twilic" https://internal/api/users \
  | twilic decode --pretty \
  | jq '.[0]'
```

### Generate test fixtures

```bash
twilic encode -i tests/fixtures/users.json -o tests/fixtures/users.twilic
git add tests/fixtures/users.twilic
```

---

## Exit codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 0    | Success                                     |
| 1    | Invalid input, decode error, or I/O failure |

---

## Related

- [Twilic AI](/ai/)
- [JavaScript Core API](/reference/javascript-core)
- [Troubleshooting](/guide/troubleshooting)
- [Playground](/guide/playground)
