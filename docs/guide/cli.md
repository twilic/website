# Twilic CLI

`@twilic/cli` is the command-line tool for encoding, decoding, and benchmarking Twilic data from terminals and scripts.

## Install

Install globally:

```bash
pnpm add -g @twilic/cli @twilic/core
```

Or run it without installing:

```bash
pnpx @twilic/cli encode --help
```

## Encode JSON to Twilic

```bash
# stdin -> stdout
echo '{"hello":"world","n":42}' | twilic encode

# file -> file
twilic encode -i data.json -o data.twilic

# debug as hex text
echo '{"hello":"world"}' | twilic encode --hex
```

Options:

- `-i, --input <file>`: input JSON file (default: stdin)
- `-o, --output <file>`: output file (default: stdout)
- `--hex`: output hex string instead of raw binary

## Decode Twilic to JSON

```bash
# stdin -> stdout
cat data.twilic | twilic decode

# pretty output
twilic decode -i data.twilic --pretty

# roundtrip check
echo '{"hello":"world"}' | twilic encode | twilic decode --pretty
```

Options:

- `-i, --input <file>`: input Twilic file (default: stdin)
- `-o, --output <file>`: output JSON file (default: stdout)
- `--pretty`: pretty-print JSON

> Twilic integers are 64-bit (`u64` / `i64`). When decoded through the JavaScript runtime, values may become `bigint` and are serialized as strings by the CLI to avoid precision loss.

## Run Benchmarks

```bash
# run default suite
twilic bench

# choose backend and duration
twilic bench --backend wasm --time-ms 2000

# append markdown report
twilic bench --markdown-out results.md
```

Options:

- `--backend <napi|wasm>`: backend runtime (default: `napi`)
- `--time-ms <ms>`: benchmark duration per task (default: `1000`)
- `--warmup-ms <ms>`: warmup duration (default: `250`)
- `--markdown-out <file>`: append markdown report to file

## Links

- [Tools overview](/tools/)
- npm: [`@twilic/cli`](https://www.npmjs.com/package/@twilic/cli)
- repository: [`twilic/cli`](https://github.com/twilic/cli)
- source docs: [`README.md`](https://github.com/twilic/cli/blob/main/README.md)
