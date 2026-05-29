# Ruby SDK

The Ruby gem provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Ruby 3.3 or later

## Install

```bash
gem install twilic
```

Or add to `Gemfile`:

```ruby
gem "twilic"
```

## Quick Start

```ruby
require "twilic"

value = Twilic.new_map(
  Twilic.entry("id", Twilic.new_u64(1001)),
  Twilic.entry("name", Twilic.new_string("alice")),
  Twilic.entry("score", Twilic.new_f64(98.6))
)

data = Twilic.encode(value)
decoded = Twilic.decode(data)

puts "encoded #{data.bytesize} bytes"
```

## API Reference

### Dynamic Encoding

```ruby
# Encode any value to binary string
Twilic.encode(value) # => String (binary)

# Decode binary string to a value
Twilic.decode(data)  # => Twilic::Value
```

### Schema-Aware Encoding

```ruby
# Encode using Bound Profile with a shared schema
Twilic.encode_with_schema(value, schema)
```

### Batch Encoding

```ruby
# Encode an array of same-shape records
Twilic.encode_batch(records)
```

### Session Encoder

```ruby
enc = Twilic::SessionEncoder.new

# Encode with persistent session state
data = enc.encode(value)

# Encode a micro-batch
data = enc.encode_micro_batch(records)

# Reset session state
enc.reset
```

## Value Construction

```ruby
Twilic.new_null
Twilic.new_bool(true)
Twilic.new_u64(1001)
Twilic.new_i64(-42)
Twilic.new_f64(3.14)
Twilic.new_string("hello")
Twilic.new_binary("\x01\x02".b)
Twilic.new_array(Twilic.new_u64(1), Twilic.new_u64(2))
Twilic.new_map(
  Twilic.entry("key", Twilic.new_string("value"))
)
```

## Project Layout

```text
twilic-ruby/
  lib/twilic.rb          # public API
  lib/twilic/core/       # wire, model, codec, session, protocol, v2
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

The repository root stays thin: `require "twilic"` only. Implementation details live under `lib/twilic/core/`.

## Source

[github.com/twilic/twilic-ruby](https://github.com/twilic/twilic-ruby)
