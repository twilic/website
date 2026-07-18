# Wire Tags

Twilic v3 uses profile-selected first-byte models. A decoder must know the active profile before interpreting byte 0.

## Dynamic Tags

Dynamic Profile retains the compact v2-style tag table for unchanged tags.

| Range / Tag  | Meaning                     |
| ------------ | --------------------------- |
| `0x00..0x7F` | positive fixint (`0..127`)  |
| `0x80..0x9F` | fixstr (`len=0..31`)        |
| `0xA0..0xAF` | fixarray (`count=0..15`)    |
| `0xB0..0xBF` | fixmap (`count=0..15`)      |
| `0xC0`       | null                        |
| `0xC1`       | false                       |
| `0xC2`       | true                        |
| `0xC3`       | float64 little-endian       |
| `0xC4..0xC7` | u8 / u16 / u32 / u64        |
| `0xC8..0xCB` | i8 / i16 / i32 / i64        |
| `0xCC..0xCE` | bin8 / bin16 / bin32        |
| `0xCF..0xD1` | str8 / str16 / str32        |
| `0xD2..0xD3` | array16 / array32           |
| `0xD4..0xD5` | map16 / map32               |
| `0xD6`       | `shape_def`                 |
| `0xD7`       | `shape_ref`                 |
| `0xD8`       | `key_ref`                   |
| `0xD9`       | `str_ref`                   |
| `0xDA`       | `typed_vec`                 |
| `0xDB`       | `row_batch`                 |
| `0xDC`       | `col_batch`                 |
| `0xDD`       | `state_patch`               |
| `0xDE`       | `template_batch`            |
| `0xDF`       | extension (`ext`)           |
| `0xE0..0xFF` | negative fixint (`-32..-1`) |

Dynamic fixed-width integer payloads and fixed-width length/count fields are little-endian.

## Bound and Batch Envelope Kinds

Bound and Batch profiles use message-kind envelopes when self-delimiting payloads are needed.

| Kind   | Name             | Purpose                                  |
| ------ | ---------------- | ---------------------------------------- |
| `0x00` | `SCALAR`         | scalar root                              |
| `0x01` | `ARRAY`          | dynamic heterogeneous array              |
| `0x02` | `MAP`            | dynamic map                              |
| `0x03` | `SHAPED_OBJECT`  | object using a session shape             |
| `0x04` | `SCHEMA_OBJECT`  | schema-aware object                      |
| `0x05` | `TYPED_VECTOR`   | homogeneous typed vector                 |
| `0x06` | `ROW_BATCH`      | row-wise batch                           |
| `0x07` | `COLUMN_BATCH`   | schema-less or shape-bound column batch  |
| `0x08` | `CONTROL`        | table and profile updates                |
| `0x09` | `EXT`            | extension                                |
| `0x0A` | `STATE_PATCH`    | patch against a base                     |
| `0x0B` | `TEMPLATE_BATCH` | micro-batch based on a template          |
| `0x0C` | `CONTROL_STREAM` | control lane for packed control payloads |
| `0x0D` | `BASE_SNAPSHOT`  | snapshot used by patches                 |
| `0x0E` | `SCHEMA_BATCH`   | schema-aware columnar batch              |
| `0x0F` | `BOUND_STREAM`   | schema-bound compact record stream       |

Bound/Batch byte-0 values outside `0x00..0x0F` are reserved in the v3 reference profile and fail decode unless a negotiated extension defines them.

## Message-Local Reuse

### `shape_def` (`0xD6`)

```text
0xD6 [shape_id][key_count][key_0]...[key_n]
```

`shape_def` declares an ordered key sequence for the current top-level message. It is not a decoded application value and does not count toward array element count.

### `shape_ref` (`0xD7`)

```text
0xD7 [shape_id][value_0]...[value_n]
```

`shape_ref` references a prior `shape_def` and produces one decoded object value.

### `key_ref` (`0xD8`)

```text
0xD8 [key_id]
```

`key_id` is a zero-based Twilic-PV id assigned once per top-level message for eligible map key literals.

### `str_ref` (`0xD9`)

```text
0xD9 [str_id]
```

`str_id` is a zero-based Twilic-PV id assigned once per string-table scope. Dynamic Profile registers string values in value position, excluding map keys and `shape_def` keys.

All Dynamic intern tables reset at each top-level message boundary unless a stateful extension explicitly changes the scope.
