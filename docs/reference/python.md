# Python API Reference

Native Python implementation of Twilic v2 (v3 support pending). Dynamic Profile remains largely wire-compatible with the Go and Rust encoders where tags are unchanged; Bound/Batch v3 forms require a v3 SDK.

**Package:** `twilic`  
**Source:** [github.com/twilic/twilic-python](https://github.com/twilic/twilic-python)

## Install

```bash
pip install twilic
```

## High-level API

```python
import twilic

# Stateless dynamic
payload = twilic.encode(value)
restored = twilic.decode(payload)

# Batch
payload = twilic.encode_batch(records)

# Schema-aware
payload = twilic.encode_with_schema(schema, value)

# Session
enc = twilic.create_session_encoder()
frame = enc.encode(value)
patch = enc.encode_patch(updated)
enc.reset()
```

## Building values

```python
import twilic

value = twilic.new_map(
    twilic.entry("id", twilic.new_u64(1001)),
    twilic.entry("name", twilic.new_string("alice")),
    twilic.entry("active", twilic.new_bool(True)),
    twilic.entry("tags", twilic.new_array(
        twilic.new_string("admin"),
        twilic.new_string("beta"),
    )),
)
```

| Constructor                 | Type      |
| --------------------------- | --------- |
| `new_null()`                | null      |
| `new_bool(v)`               | bool      |
| `new_i64(v)` / `new_u64(v)` | integer   |
| `new_f64(v)`                | float     |
| `new_string(v)`             | str       |
| `new_binary(v)`             | bytes     |
| `new_array(*items)`         | list      |
| `new_map(*entries)`         | dict      |
| `entry(key, value)`         | map entry |

## SessionEncoder

```python
enc = twilic.create_session_encoder(
    max_base_snapshots=8,
    enable_state_patch=True,
    enable_template_batch=True,
    enable_trained_dictionary=True,
    unknown_reference_policy="failFast",  # or "statelessRetry"
)

enc.encode(value)           # full frame
enc.encode_patch(value)     # state patch
enc.encode_batch(records)   # row batch
enc.encode_micro_batch(records)
enc.reset()
```

## TwilicCodec (low-level)

```python
codec = twilic.TwilicCodec()
payload = codec.encode_value(value)
restored = codec.decode_value(payload)

msg = codec.encode_message(message)
restored_msg = codec.decode_message(payload)
```

Access to full `Message` model, patch opcodes, control messages, and column batches.

## Message model

Full message kinds for advanced pipelines:

- `MessageKindScalar`, `MessageKindArray`, `MessageKindMap`
- `MessageKindShapedObject`, `MessageKindSchemaObject`
- `MessageKindTypedVector`, `MessageKindRowBatch`, `MessageKindColumnBatch`
- `MessageKindStatePatch`, `MessageKindTemplateBatch`
- `MessageKindControl`, `MessageKindControlStream`, `MessageKindBaseSnapshot`

Patch opcodes: `PatchOpcodeKeep`, `PatchOpcodeReplaceScalar`, `PatchOpcodePrefixDelta`, and others.

## Errors

```python
from twilic import TwilicError, ErrStatelessRetryRequired, ErrUnknownReference
```

| Exception                   | Meaning                                     |
| --------------------------- | ------------------------------------------- |
| `ErrStatelessRetryRequired` | Unknown base/shape ref — request full frame |
| `ErrUnknownReference`       | Reference not in session tables             |
| `ErrInvalidData`            | Malformed wire bytes                        |

## Interop

Python encoder output decodes in any v2-conforming SDK. Run cross-language smoke tests:

```bash
cd twilic-python && ./scripts/check-interop.sh
```

See [Interop guide](/guide/interop).

## Related

- [Rust API](/reference/rust)
- [Go API](/reference/go)
- [Cookbook — Telemetry](/guide/cookbook#telemetry-pipeline)
