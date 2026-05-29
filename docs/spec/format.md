# Format Guide

This guide describes the Twilic v2 wire layout in practical terms. It mirrors the normative rules in the full specification, with focus on byte structure and decode shape.

## Wire Model Overview

v2 uses a tag-table model. The first byte is always a tag family or fixed literal tag. Unlike v1, there is no top-level message-kind envelope byte.

### First-Byte Compact Families

| Range        | Meaning                     |
| ------------ | --------------------------- |
| `0x00..0x7F` | positive fixint (`0..127`)  |
| `0x80..0x9F` | fixstr (`len=0..31`)        |
| `0xA0..0xAF` | fixarray (`count=0..15`)    |
| `0xB0..0xBF` | fixmap (`count=0..15`)      |
| `0xE0..0xFF` | negative fixint (`-32..-1`) |

## Dynamic Container Shapes

### Map Body

```text
[fixmap | map16 | map32] [key] [value] ...
```

Key representations:

- key literal (`fixstr` / `str8` / `str16` / `str32`)
- `key_ref`: `0xD8 [varuint key_id]`

Unknown `key_ref` id is a hard decode error.

### Array Body

```text
[fixarray | array16 | array32] [value_0] [value_1] ...
```

An array may remain generic, or be promoted to:

- `typed_vec` for homogeneous primitive arrays
- shape forms for homogeneous map arrays

## Message-Local Reuse Forms

v2 does not require session state for structural reuse — all reuse tables are per-message and reset at each top-level message boundary.

### `shape_def` (`0xD6`)

Defines an ordered key sequence and registers `shape_id` in the current message.

```text
0xD6 [shape_id] [key_count] [key_0] ... [key_n]
```

### `shape_ref` (`0xD7`)

References a prior shape in the current message and encodes only values.

```text
0xD7 [shape_id] [value_0] ... [value_n]
```

Unknown `shape_ref` id is a decode error.

### `key_ref` / `str_ref`

- `key_ref` (`0xD8`) references key literals already emitted in the message.
- `str_ref` (`0xD9`) references string value literals already emitted in the message.

All intern tables (`key_id`, `str_id`, `shape_id`) reset at each top-level message boundary.

## Typed Vector

```text
0xDA [element_type] [count] [codec] [payload]
```

`element_type` identifies the scalar type of all elements (u8, u16, u32, u64, i8, i16, i32, i64, f64).

`codec` identifies the compression applied to the payload column. Codec choice must be deterministic for equal input statistics and equal profile configuration.

## Row and Column Batch

### `row_batch` (`0xDB`)

```text
0xDB [shape_id] [row_count] [row_0_values] ... [row_n_values]
```

The `shape_id` references a prior `shape_def` in the same message or a session-registered shape. Each row encodes only its values in shape-key order.

### `col_batch` (`0xDC`)

```text
0xDC [shape_id] [row_count] [col_0_header + col_0_payload] ... [col_n_header + col_n_payload]
```

Each column header specifies:

- `element_type`
- `codec`
- payload length

Columns are packed end-to-end. Decoder reconstructs rows by reading one value per column, for each of `row_count` rows.

## Stateful Forms

Stateful forms require session state and ordered, reliable delivery.

### `state_patch` (`0xDD`)

```text
0xDD [optional base_ref] [patch_operations ...]
```

`patch_operations` describe field-level changes: KEEP, REPLACE, APPEND, DELETE. Decoder reconstructs the current message by applying operations to the base or previous message.

### `template_batch` (`0xDE`)

```text
0xDE [template_id] [count] [record_0] ... [record_n]
```

`template_id` references a registered template (shape + optional-field presence pattern). Each record encodes only its present, non-default values.

## Extension Point

```text
0xDF [ext_type] [length] [payload]
```

Extension types below `0x80` are reserved for future Twilic use. Extension types `0x80..0xFF` are available for application-defined use.

## Varuint Encoding

Twilic-PV varuint is used for metadata fields: lengths, counts, `key_id`, `str_id`, `shape_id`, `schema_id`, `base_id`, `template_id`.

```text
byte 0: high bit = 1 if more bytes follow; low 7 bits = value bits
```

Varuint domains in v2 are used for metadata, not for replacing fixed integer value tags.
