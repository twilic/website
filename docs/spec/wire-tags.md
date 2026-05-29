# Wire Tags

Twilic v2 uses a compact tag-table wire model. The first byte is always a tag family or fixed literal tag — there is no top-level message-kind envelope byte.

## First-Byte Compact Families

These ranges encode common values without an additional tag byte.

| Range        | Meaning                     | Notes                |
| ------------ | --------------------------- | -------------------- |
| `0x00..0x7F` | positive fixint (`0..127`)  | Direct integer value |
| `0x80..0x9F` | fixstr (`len=0..31`)        | Low 5 bits = length  |
| `0xA0..0xAF` | fixarray (`count=0..15`)    | Low 4 bits = count   |
| `0xB0..0xBF` | fixmap (`count=0..15`)      | Low 4 bits = count   |
| `0xE0..0xFF` | negative fixint (`-32..-1`) | Two's complement     |

## Extended Tags (`0xC0..0xDF`)

| Tag    | Name             | Description                                 |
| ------ | ---------------- | ------------------------------------------- |
| `0xC0` | `null`           | Null / absence                              |
| `0xC1` | `false`          | Boolean false                               |
| `0xC2` | `true`           | Boolean true                                |
| `0xC3` | `float64`        | 64-bit float, little-endian                 |
| `0xC4` | `uint8`          | 8-bit unsigned integer                      |
| `0xC5` | `uint16`         | 16-bit unsigned integer                     |
| `0xC6` | `uint32`         | 32-bit unsigned integer                     |
| `0xC7` | `uint64`         | 64-bit unsigned integer                     |
| `0xC8` | `int8`           | 8-bit signed integer                        |
| `0xC9` | `int16`          | 16-bit signed integer                       |
| `0xCA` | `int32`          | 32-bit signed integer                       |
| `0xCB` | `int64`          | 64-bit signed integer                       |
| `0xCC` | `bin8`           | Binary, 8-bit length prefix                 |
| `0xCD` | `bin16`          | Binary, 16-bit length prefix                |
| `0xCE` | `bin32`          | Binary, 32-bit length prefix                |
| `0xCF` | `str8`           | String, 8-bit length prefix                 |
| `0xD0` | `str16`          | String, 16-bit length prefix                |
| `0xD1` | `str32`          | String, 32-bit length prefix                |
| `0xD2` | `array16`        | Array, 16-bit count prefix                  |
| `0xD3` | `array32`        | Array, 32-bit count prefix                  |
| `0xD4` | `map16`          | Map, 16-bit count prefix                    |
| `0xD5` | `map32`          | Map, 32-bit count prefix                    |
| `0xD6` | `shape_def`      | Define a key sequence for shape interning   |
| `0xD7` | `shape_ref`      | Reference a prior shape; encode values only |
| `0xD8` | `key_ref`        | Reference a previously seen map key         |
| `0xD9` | `str_ref`        | Reference a previously seen string value    |
| `0xDA` | `typed_vec`      | Typed homogeneous vector with codec         |
| `0xDB` | `row_batch`      | Row-wise batch of same-shape records        |
| `0xDC` | `col_batch`      | Columnar batch with per-column codecs       |
| `0xDD` | `state_patch`    | Delta against a previous message or base    |
| `0xDE` | `template_batch` | Micro-batch reuse for repeated patterns     |
| `0xDF` | `ext`            | Extension point                             |

## Interning Tags

### `shape_def` (`0xD6`)

Defines an ordered key sequence and registers a `shape_id` for the current message.

```text
0xD6 [shape_id] [key_count] [key_0] ... [key_n]
```

### `shape_ref` (`0xD7`)

References a prior `shape_def` in the same message. Only values are encoded — keys are omitted.

```text
0xD7 [shape_id] [value_0] ... [value_n]
```

Unknown `shape_ref` id is a hard decode error.

### `key_ref` (`0xD8`)

References a map key literal already emitted in the current message.

```text
0xD8 [varuint key_id]
```

### `str_ref` (`0xD9`)

References a string value literal already emitted in the current message.

```text
0xD9 [varuint str_id]
```

All intern tables (`key_id`, `str_id`, `shape_id`) **reset at each top-level message boundary**.

## Batch Tags

### `typed_vec` (`0xDA`)

Typed homogeneous vector. Codec is selected per vector.

```text
0xDA [element_type] [count] [codec] [payload]
```

Available codecs: `DIRECT_BITPACK`, `DELTA_BITPACK`, `FOR_BITPACK`, `DELTA_FOR_BITPACK`, `DELTA_DELTA_BITPACK`, `RLE`, `PATCHED_FOR`, `SIMPLE8B`, `XOR_FLOAT`.

### `row_batch` (`0xDB`)

Row-wise batch of same-shape records.

```text
0xDB [shape_id] [row_count] [row_0_values] ... [row_n_values]
```

### `col_batch` (`0xDC`)

Columnar batch. Each column is encoded independently with its own codec.

```text
0xDC [shape_id] [row_count] [col_0_codec + payload] ... [col_n_codec + payload]
```

## Stateful Tags

These tags require session state and ordered, reliable delivery.

### `state_patch` (`0xDD`)

Delta payload against the previous message or an explicit base snapshot.

```text
0xDD [base_ref?] [patch_ops...]
```

### `template_batch` (`0xDE`)

Micro-batch reuse for repeated schema or shape bursts.

```text
0xDE [template_id] [count] [record_0] ... [record_n]
```
