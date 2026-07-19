# Rust API Reference

`twilic-rust` is the reference implementation. All other SDKs are built from or tested against this crate.

**Crate:** `twilic`  
**Source:** [github.com/twilic/twilic-rust](https://github.com/twilic/twilic-rust)

## Install

```toml
[dependencies]
twilic = "3.1"
```

## High-level API

```rust
use twilic::{encode, decode, encode_with_schema, encode_batch, encode_bound_stream, encode_batch_with_schema, create_session_encoder, Value};

// Stateless dynamic
let bytes = encode(&value)?;
let restored = decode(&bytes)?;

// Schema-aware (Bound profile)
let bytes = encode_with_schema(&schema, &value)?;

// Batch
let bytes = encode_batch(&records)?;

// v3 schema batch / bound stream
let batch = encode_batch_with_schema(&schema, &records)?;
let stream = encode_bound_stream(&schema, &records)?;

// Session
let mut enc = create_session_encoder(SessionOptions::default());
let frame = enc.encode(&value)?;
let patch = enc.encode_patch(&updated)?;
enc.reset();
```

## Value type

```rust
pub enum Value {
    Null,
    Bool(bool),
    I64(i64),
    U64(u64),
    F64(f64),
    String(String),
    Binary(Vec<u8>),
    Array(Vec<Value>),
    Map(Vec<(String, Value)>),
}
```

Constructors follow standard Rust patterns. Maps use `Vec<(String, Value)>` ordered pairs.

## SessionEncoder

```rust
pub struct SessionEncoder { /* ... */ }

impl SessionEncoder {
    pub fn new(options: SessionOptions) -> Self;
    pub fn encode(&mut self, value: &Value) -> Result<Vec<u8>>;
    pub fn encode_patch(&mut self, value: &Value) -> Result<Vec<u8>>;
    pub fn encode_batch(&mut self, values: &[Value]) -> Result<Vec<u8>>;
    pub fn encode_micro_batch(&mut self, values: &[Value]) -> Result<Vec<u8>>;
    pub fn encode_with_schema(&mut self, schema: &Schema, value: &Value) -> Result<Vec<u8>>;
    pub fn decode(&mut self, bytes: &[u8]) -> Result<Value>;
    pub fn decode_message(&mut self, bytes: &[u8]) -> Result<Message>;
    pub fn reset(&mut self);
}
```

## SessionOptions

```rust
pub struct SessionOptions {
    pub max_base_snapshots: usize,       // default: 8
    pub enable_state_patch: bool,        // default: true
    pub enable_template_batch: bool,     // default: true
    pub enable_trained_dictionary: bool, // default: true
    pub unknown_reference_policy: UnknownReferencePolicy, // default: FailFast
}

pub enum UnknownReferencePolicy {
    FailFast,
    StatelessRetry,
}
```

## TwilicCodec (low-level)

For direct message-level encode/decode without the high-level value API:

```rust
use twilic::{TwilicCodec, Message, Value};

let mut codec = TwilicCodec::default();
let bytes = codec.encode_value(&value)?;
let decoded = codec.decode_value(&bytes)?;

let msg = codec.encode_message(&message)?;
let restored = codec.decode_message(&msg)?;
```

`TwilicCodec` maintains encoder state (shape tables, string intern tables, session state) across calls.

## Message model

Low-level wire message kinds for debugging and advanced use:

```rust
pub enum Message {
    Scalar(Value),
    Array(Vec<Value>),
    Map(Vec<MapEntry>),
    ShapedObject { shape_id, presence, values },
    SchemaObject { schema_id, presence, fields },
    TypedVector(TypedVector),
    RowBatch { rows },
    ColumnBatch { count, columns },
    Control(ControlMessage),
    Ext { ext_type, payload },
    StatePatch { base_ref, operations, literals },
    TemplateBatch { template_id, count, changed_column_mask, columns },
    ControlStream { codec, payload },
    BaseSnapshot { base_id, schema_or_shape_ref, payload },
}
```

See [Spec — Format Guide](/spec/format) for wire semantics of each kind.

## Schema

```rust
pub struct Schema {
    pub schema_id: u64,
    pub name: String,
    pub fields: Vec<SchemaField>,
}
```

## Error handling

```rust
pub enum TwilicError { /* ... */ }
pub type Result<T> = std::result::Result<T, TwilicError>;
```

Key variants: `DecodeDepthLimitExceeded`, `DecodeCountLimitExceeded`, `StatelessRetryRequired`, `UnknownReference`.

## Decode safety constants

```rust
use twilic::{DEFAULT_MAX_DECODE_COUNT, DEFAULT_MAX_DECODE_OUTPUT_RATIO};
```

See [Errors & Limits](/reference/errors-and-limits).

## Project layout

```text
twilic-rust/src/
  lib.rs       # Public re-exports
  v2.rs        # High-level encode/decode
  model.rs     # Value, Message, Schema, PatchOpcode
  protocol.rs  # TwilicCodec, SessionEncoder
  session.rs   # SessionOptions, intern tables
  codec.rs     # Vector codec selection
  wire.rs      # Low-level reader/writer, safety limits
  error.rs     # TwilicError
```

## Related

- [JavaScript SDK](/reference/javascript-core)
- [Interop guide](/guide/interop)
- [Performance guide](/guide/performance)
