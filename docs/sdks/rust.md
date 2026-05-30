# Rust SDK

The Rust crate is the canonical reference implementation for Twilic v2. It provides the highest performance and is the foundation for the JavaScript SDK (N-API and WASM builds).

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

## Value Model

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

### Type mapping from Rust primitives

| Rust type | Twilic Value | Notes |
| --- | --- | --- |
| `bool` | `Value::Bool` | - |
| `u8`..`u64` | `Value::U8`..`Value::U64` | Encoder picks smallest width automatically |
| `i8`..`i64` | `Value::I8`..`Value::I64` | - |
| `f32` | `Value::F64` | Upcast — no `f32` tag in v2 |
| `f64` | `Value::F64` | - |
| `String` / `&str` | `Value::String` | - |
| `Vec<u8>` / `&[u8]` | `Value::Binary` | Raw bytes, no base64 |
| `Option<T>` | `Value::Null` or inner value | - |
| `Vec<Value>` | `Value::Array` | - |
| `Vec<(String, Value)>` | `Value::Map` | Order is preserved |

## API Reference

### Dynamic Encoding

```rust
// Encode any Value to bytes (Dynamic Profile)
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
// Encode a slice of same-shape records as row_batch or col_batch
pub fn encode_batch(records: &[Value]) -> Result<Vec<u8>, TwilicError>
```

### Session Encoder

For stateful streams — maintains key/shape/string interning state across messages:

```rust
use twilic::SessionEncoder;

let mut encoder = SessionEncoder::new();

// First call emits full message + intern table registrations
let bytes = encoder.encode(&value)?;

// Subsequent calls use key_ref / shape_ref / str_ref automatically
let bytes = encoder.encode(&next_value)?;

// Encode a micro-batch
let bytes = encoder.encode_micro_batch(&records)?;

// Encode only changed fields (state_patch)
let bytes = encoder.encode_patch(&updated_value)?;

// Reset all session state — next encode is a full stateless message
encoder.reset();
```

## Error Handling

```rust
use twilic::{decode, encode, TwilicError, Value};

match decode(bytes) {
    Ok(value) => { /* use value */ }
    Err(TwilicError::UnknownKeyRef(id)) => {
        // key_ref referenced an ID not defined in this message
        eprintln!("unknown key_ref: {id}");
    }
    Err(TwilicError::UnknownShapeRef(id)) => {
        // shape_ref referenced an ID not defined in this message
    }
    Err(TwilicError::UnknownStrRef(id)) => {
        // str_ref referenced an ID not defined in this message
    }
    Err(TwilicError::InvalidTag(byte)) => {
        // Unrecognized first byte
    }
    Err(TwilicError::UnexpectedEof) => {
        // Buffer truncated
    }
    Err(e) => eprintln!("decode error: {e}"),
}
```

All decode errors are hard failures — unknown references are never silently accepted per the v2 spec.

## Building with Cargo Features

```toml
[dependencies]
twilic = { git = "https://github.com/twilic/twilic-rust.git", features = ["session", "schema"] }
```

| Feature   | Description                                                 |
| --------- | ----------------------------------------------------------- |
| `session` | Enables `SessionEncoder` and stateful forms                 |
| `schema`  | Enables `encode_with_schema` and Bound Profile              |
| `batch`   | Enables `encode_batch`, `col_batch`, `row_batch`            |
| `serde`   | Enables `serde::Serialize`/`Deserialize` derive for `Value` |

## Project Layout

```text
twilic-rust/
  src/
    lib.rs          # public API
    value.rs        # Value enum
    encode/         # encoder (dynamic, bound, batch, session)
    decode/         # decoder
    codec/          # vector codecs (bitpack, RLE, delta, XOR)
    session/        # SessionEncoder, state patch, template batch
    schema/         # Schema, FieldType, presence bitmap
  tests/            # spec conformance and interop tests
  scripts/          # interop fixture generation
  docs/
```

## Source

[github.com/twilic/twilic-rust](https://github.com/twilic/twilic-rust)
