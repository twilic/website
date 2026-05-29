# Python SDK

The Python package provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Python 3.12 or later

## Install

```bash
pip install twilic
```

Or with [uv](https://docs.astral.sh/uv/):

```bash
uv add twilic
```

## Quick Start

```python
import twilic

value = twilic.new_map(
    twilic.entry("id", twilic.new_u64(1001)),
    twilic.entry("name", twilic.new_string("alice")),
    twilic.entry("score", twilic.new_f64(98.6)),
)

data = twilic.encode(value)
decoded = twilic.decode(data)

assert decoded == value
print(f"encoded {len(data)} bytes")
```

## API Reference

### Dynamic Encoding

```python
# Encode any value to bytes (Dynamic Profile)
def encode(value: Value) -> bytes: ...

# Decode bytes to a value
def decode(data: bytes) -> Value: ...
```

### Schema-Aware Encoding

```python
# Encode using Bound Profile with a shared schema
def encode_with_schema(value: Value, schema: Schema) -> bytes: ...
```

### Batch Encoding

```python
# Encode a list of same-shape records
def encode_batch(records: list[Value]) -> bytes: ...
```

### Session Encoder

```python
from twilic import SessionEncoder

enc = SessionEncoder()

# Encode with persistent session state
data = enc.encode(value)

# Encode a micro-batch
data = enc.encode_micro_batch(records)

# Reset session state
enc.reset()
```

## Value Construction

```python
twilic.new_null()
twilic.new_bool(True)
twilic.new_u64(1001)
twilic.new_i64(-42)
twilic.new_f64(3.14)
twilic.new_string("hello")
twilic.new_binary(b"\x01\x02")
twilic.new_array(twilic.new_u64(1), twilic.new_u64(2))
twilic.new_map(
    twilic.entry("key", twilic.new_string("value")),
)
```

## Project Layout

```text
twilic-python/
  src/twilic/            # wire, model, codec, session, protocol, v2
  tests/                 # spec conformance and interop tests
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-python](https://github.com/twilic/twilic-python)
