# Encoding Guide

This guide covers scalar, reference, and vector encoding behavior for Twilic v2. Implementations follow these rules to stay deterministic and interoperable.

## Lengths and IDs

Lengths and IDs use varuint encoding:

- dynamic lengths
- `key_id`, `str_id`, `shape_id`
- `base_id`, `template_id`, and other state IDs (when session features are enabled)

Varuint domains in v2 are for metadata, not for replacing fixed-width integer value tags.

## Scalar Rules

### Integers

- Use fixint for `-32..127` first.
- Otherwise use the smallest valid fixed-width tag: `i8`/`i16`/`i32`/`i64` or `u8`/`u16`/`u32`/`u64`.
- Encoder SHOULD choose the smallest valid width.

Recommended width order:

| Type     | Selection order                         |
| -------- | --------------------------------------- |
| Signed   | `fixint` → `i8` → `i16` → `i32` → `i64` |
| Unsigned | `fixint` → `u8` → `u16` → `u32` → `u64` |

### Float

- Scalar float uses `f64` (`0xC3`), little-endian.
- No `f32` tag exists in v2.

### Strings and Binary

| Data   | Short (≤ 31 bytes) | Medium | Large             |
| ------ | ------------------ | ------ | ----------------- |
| String | `fixstr`           | `str8` | `str16` / `str32` |
| Binary | —                  | `bin8` | `bin16` / `bin32` |

Length tags MUST match actual payload byte length exactly.

## Per-Message Interning

### Keys

Literal map keys are registered in first-seen order and assigned a `key_id`. Repeated keys in the same message MAY be replaced with `key_ref`.

Registration order is part of deterministic behavior and cannot be implementation-random.

### String Values

Literal string values are registered in first-seen order and assigned a `str_id`. Repeated values MAY be replaced with `str_ref`.

Interning state resets at each top-level message boundary.

Unknown `key_ref`/`str_ref` IDs MUST fail decode.

### Shape IDs

Shape IDs are message-local and assigned in first-seen order when `shape_def` appears. `shape_ref` may only reference prior shape IDs in the same top-level message.

## Typed Vector Codecs

`typed_vec` payload:

```text
0xDA [element_type] [count] [codec] [payload]
```

### Supported Codecs

| Codec | Best for |
| --- | --- |
| `DIRECT_BITPACK` | Integers with known max value |
| `DELTA_BITPACK` | Monotone or slowly-changing sequences |
| `FOR_BITPACK` | Frame-of-reference + bitpack |
| `DELTA_FOR_BITPACK` | Delta + FOR + bitpack |
| `DELTA_DELTA_BITPACK` | Second-order delta (accelerations, timestamps) |
| `RLE` | Runs of identical values |
| `PATCHED_FOR` | FOR with outlier patching |
| `SIMPLE8B` | General-purpose: packs multiple small integers per 64-bit word |
| `XOR_FLOAT` | Float sequences (XOR of adjacent values, then bitpack) |

Codec choice SHOULD be deterministic for equal input statistics and equal profile configuration.

## Schema-Aware (Bound Profile) Encoding

### Presence Bitmap

Optional fields use a presence bitmap:

- `1` = field present
- `0` = field absent

If most fields are present, a 1-bit invert flag allows the inverted interpretation:

- `0` = field present
- `1` = field absent

If all fields are known present, the presence bitmap may be omitted entirely (schema or profile must fix this behavior).

### Range-Aware Bit Packing

When a schema field has a known value range `[min, max]`:

```text
stored_value = actual_value - min
bit_width = ceil(log2(max - min + 1))
```

This eliminates wasted bits for constrained fields (enums, bounded integers, short string lengths).

### Zigzag Encoding

For signed integers without a known range, zigzag encoding maps signed values to unsigned space before width selection:

```text
zigzag(n) = (n << 1) ^ (n >> 63)   // for 64-bit
```

## Determinism Requirements

The following behaviors MUST be deterministic across independent encoder runs with equal inputs and equal profile state:

- Integer width selection
- Codec selection for `typed_vec` and `col_batch` columns
- `key_id`, `str_id`, `shape_id` assignment order (first-seen order, not hash-random)
- Presence bitmap layout

Implementations MUST NOT randomize any of these choices.
