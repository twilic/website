# Elixir SDK

The Elixir library provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Elixir 1.19 or later
- OTP 27 or later

## Install

```elixir
def deps do
  [
    {:twilic, git: "https://github.com/twilic/twilic-elixir.git"}
  ]
end
```

## Quick Start

```elixir
value =
  Twilic.new_map([
    Twilic.entry("id", Twilic.new_u64(1001)),
    Twilic.entry("name", Twilic.new_string("alice")),
    Twilic.entry("score", Twilic.new_f64(98.6)),
  ])

encoded = Twilic.encode(value)
decoded = Twilic.decode(encoded)
```

## API Reference

### Dynamic Encoding

```elixir
Twilic.encode(value)  # binary
Twilic.decode(bytes)  # value tree
```

### Schema-Aware Encoding

```elixir
Twilic.encode_with_schema(value, schema)
```

### Batch Encoding

```elixir
Twilic.encode_batch(records)
```

## Project Layout

```text
twilic-elixir/
  lib/twilic/            # wire, model, codec, session, protocol, v2
  test/
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-elixir](https://github.com/twilic/twilic-elixir)
