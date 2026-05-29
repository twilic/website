# Rust SDK

The Rust crate is the canonical reference implementation for Twilic v2. It provides the highest performance and is used as the foundation for the JavaScript SDK (via N-API and WASM).

## Requirements

- Rust stable (edition 2024)

## Install

From GitHub:

```toml
[dependencies]
twilic = { git = "https://github.com/twilic/twilic-rust.git" }
```

From crates.io (when published):

```toml
[dependencies]
twilic = "0.1"
```

## Quick Start

```rust
use twilic::{decode, encode, Value};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let value = Value::Map(vec![
        ("id".to_string(), Value::U64(1001)),
        ("name".to_string(), Value::String("alice".to_string())),
        ("score".to_string(), Value::F64(98.6)),
    ]);

    let bytes = encode(&value)?;
    let decoded = decode(&bytes)?;

    assert_eq!(value, decoded);
    println!("encoded {} bytes", bytes.len());
    Ok(())
}
```

## API Reference

### Dynamic Encoding

```rust
// Encode any Value to bytes
pub fn encode(value: &Value) -> Result<Vec<u8>, TwilicError>

// Decode bytes to a Value
pub fn decode(bytes: &[u8]) -> Result<Value, TwilicError>
```

### Schema-Aware Encoding

```rust
// Encode using Bound Profile with a shared schema
pub fn encode_with_schema(value: &Value, schema: &Schema) -> Result<Vec<u8>, TwilicError>
```

### Batch Encoding

```rust
// Encode a batch of same-shape records
pub fn encode_batch(records: &[Value]) -> Result<Vec<u8>, TwilicError>
```

### Session Encoder

For stateful streams:

```rust
use twilic::SessionEncoder;

let mut encoder = SessionEncoder::new();

// Encode with session state (key/shape/string interning persists)
let bytes = encoder.encode(&value)?;

// Encode a micro-batch
let bytes = encoder.encode_micro_batch(&records)?;

// Reset session state
encoder.reset();
```

## Value Types

```rust
pub enum Value {
    Null,
    Bool(bool),
    U8(u8),
    U16(u16),
    U32(u32),
    U64(u64),
    I8(i8),
    I16(i16),
    I32(i32),
    I64(i64),
    F64(f64),
    String(String),
    Binary(Vec<u8>),
    Array(Vec<Value>),
    Map(Vec<(String, Value)>),
}
```

## Project Layout

```text
twilic-rust/
  src/          # wire, model, codec, session, protocol, v2
  tests/        # spec conformance and interop tests
  scripts/      # interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-rust](https://github.com/twilic/twilic-rust)
