# Format Guide

This guide describes the Twilic v3 wire layout in practical terms. For normative detail, see [v3 Reference Profile](/spec/v3).

## Wire Model Overview

v3 uses profile-selected wire models.

- Dynamic Profile uses the compact tag table described in [Wire Tags](/spec/wire-tags).
- Bound and Batch Profiles use message-kind envelopes when self-delimiting payloads are needed.
- `BOUND_STREAM (0x0F)` binds a schema for compact record streams.
- `SCHEMA_BATCH (0x0E)` is the schema-aware columnar batch form.

A decoder must know the active profile before interpreting byte 0.

## Dynamic Containers

### Map Body

```text
[fixmap|map16|map32][key][value]...
```

Key forms:

- key literal string
- `key_ref` + zero-based `key_id`

Unknown `key_ref` ids fail decode.

### Array Body

```text
[fixarray|array16|array32][element_0][element_1]...
```

Arrays may include message-local `shape_def` declarations before decoded elements. Those declarations do not count toward decoded element count.

## `SCHEMA_OBJECT` (`0x04`)

`SCHEMA_OBJECT` is an independently decodable Bound object when the resolved schema is known.

```text
0x04 [has_schema_id][schema_id?][has_presence][presence bytes?][field payloads...]
```

`has_schema_id` and `has_presence` are one-byte flags: `0x00 = false`, `0x01 = true`; other values fail decode.

For compact `SCHEMA_OBJECT`, field payloads use:

```text
[fixed bit group][byte payloads...]
```

after presence bytes, following compact record-body bit order and padding rules.

## `BOUND_STREAM` (`0x0F`)

`BOUND_STREAM` is the schema-bound compact stream form.

```text
0x0F [schema_id?][count?][presence_strategy][record_body...]
```

The v3 reference profile includes `schema_id` and `count` unless an enclosing transport/profile explicitly declares external schema identity and framing. If `count` is omitted, external framing must supply record count, byte extent, or terminal end-of-stream. Multiplexed/framed transports must provide count or byte extent.

`presence_strategy` values:

| Value  | Meaning                    |
| ------ | -------------------------- |
| `0x00` | normal bitmap per record   |
| `0x01` | inverted bitmap per record |
| `0x02` | all-present elided         |

Each record body is decoded using schema order:

```text
[presence bits?][fixed bit group][byte payloads...]
```

- Presence bits are least-significant-bit first in schema optional-field order and zero-padded to a byte boundary.
- The fixed bit group packs bool, enum, and `range_bits` fields least-significant-bit first in schema order.
- Byte payloads contain `fixed_le`, float, varints, strings, binary values, and other byte-aligned fields in schema order.
- Non-zero padding bits fail decode.

## `SCHEMA_BATCH` (`0x0E`)

```text
0x0E [schema_id?][count][column_count?][columns...]
```

The v3 reference profile includes `column_count` and omits `field_id` in strict schema-order compact mode.

Each column contains:

```text
[field_id?][null_strategy][presence bits?][codec][typed vector payload]
```

`null_strategy` values:

| Value | Meaning                              |
| ----- | ------------------------------------ |
| `0`   | all rows present; no presence bitmap |
| `1`   | normal bitmap                        |
| `2`   | inverted bitmap                      |

Presence bitmaps are row-order, least-significant-bit first, and zero-padded to `ceil(count / 8)` bytes. Nullable/optional column payloads encode present values only; decoded element count is `popcount(presence)` or `count` for all-present.

## Stateful Envelope Kinds

Stateful envelope kinds such as `STATE_PATCH (0x0A)`, `TEMPLATE_BATCH (0x0B)`, `CONTROL_STREAM (0x0C)`, and `BASE_SNAPSHOT (0x0D)` require a negotiated stateful profile. The v3 reference interoperability profile is stateless unless such a profile is negotiated.

## Compatibility

- v3 is a clean break from v2 for Bound Profile field/record-body payloads.
- Dynamic Profile may remain v2-compatible where tags are unchanged.
- Implementations supporting multiple profiles or versions must use an explicit external profile and version discriminator.
