# Profiles

Twilic v3 defines three primary data profiles and one optional Stateful Profile. A deployment must know the active profile before interpreting byte 0.

## Dynamic Profile

Dynamic is the schema-less profile. It behaves like MessagePack for arbitrary values, with compact forms for repetition inside one top-level message.

- `key_id` and `str_id` are zero-based Twilic-PV ids scoped to the current top-level message.
- `shape_def` is a declaration, not a decoded application value.
- `shape_ref` produces one decoded object value.
- Dynamic fixed-width integers and fixed-width length/count fields are little-endian.
- Dynamic scalar integers use fixint first, then the smallest fixed-width integer tag. They do not use Twilic-PV.

Use Dynamic when you do not have a fixed schema or need MessagePack-like convenience.

## Bound Profile

Bound is schema-aware. Sender and receiver share a resolved schema identity before decoding field payloads.

- Field order is the declared schema field-array order.
- Field names are metadata and are not sent.
- Compact Bound field payloads do not carry field numbers, type tags, per-field fallback mode bytes, or fallback dynamic/literal encodings.
- `BOUND_STREAM (0x0F)` binds one schema for consecutive compact record bodies.
- `SCHEMA_OBJECT (0x04)` remains available for independently decodable Bound records when the resolved schema is known.

Bound compact record bodies use:

```text
[presence bits?][fixed bit group][byte payloads...]
```

Presence bits and fixed bit groups are least-significant-bit first and zero-padded to byte boundaries. Non-zero padding bits fail decode.

## Batch Profile

Batch bundles multiple records with the same shape or schema.

| Form                    | Tag / kind | Use                                  |
| ----------------------- | ---------- | ------------------------------------ |
| Dynamic `row_batch`     | `0xDB`     | Dynamic row-wise same-shape records. |
| Dynamic `col_batch`     | `0xDC`     | Dynamic columnar same-shape records. |
| Envelope `ROW_BATCH`    | `0x06`     | Bound/Batch envelope row-wise form.  |
| Envelope `COLUMN_BATCH` | `0x07`     | Bound/Batch envelope columnar form.  |
| `SCHEMA_BATCH`          | `0x0E`     | Shared-schema columnar batch.        |

`SCHEMA_BATCH` columns are in schema order. In the v3 reference profile, `column_count` is present and `field_id` is omitted in strict schema-order compact mode unless an enclosing profile declares otherwise.

## Stateful Profile

Stateful forms are optional negotiated extensions. They may use previous messages, base snapshots, templates, dictionaries, or persistent key/string/shape tables.

The v3 reference interoperability profile is stateless unless a transport/profile defines exact wire forms for state references, patch opcodes, reset controls, dictionary ids, and retention rules.

Dynamic stateful tags differ from Bound/Batch envelope kinds:

| Dynamic tag | Envelope kind | Meaning |
| --- | --- | --- |
| `state_patch` `0xDD` | `STATE_PATCH` `0x0A` | Patch against previous/base state. |
| `template_batch` `0xDE` | `TEMPLATE_BATCH` `0x0B` | Template-based micro-batch. |
| — | `CONTROL_STREAM` `0x0C` | Packed control lane. |
| — | `BASE_SNAPSHOT` `0x0D` | Snapshot used by patches. |

Use stateful forms only when sender and receiver have explicit profile negotiation and ordered state alignment.
