# Encoding Guide

This guide covers scalar, reference, vector, Bound, and batch encoding behavior for Twilic v3.

## Lengths and IDs

Twilic-PV is an unsigned base-128 varuint with 7 payload bits per byte, little-endian group order, and high-bit continuation. Encoders use the shortest form; decoders reject overlong forms.

Twilic-PV is used for metadata and for Bound integer fields whose physical encoding is `varuint` or `zigzag_varuint`. Dynamic scalar integers do not use Twilic-PV.

Dynamic `str`/`bin`/`array`/`map` tag lengths use tag-defined fixed-width length fields. Dynamic fixed-width integer payloads and fixed-width length/count fields are little-endian.

## Dynamic Integers

The v3 reference profile must encode Dynamic integers with this canonical order:

- `-32..-1`: negative fixint
- `0..127`: positive fixint
- otherwise use the smallest valid fixed-width signed or unsigned tag

## Bound Integers

Bound fields are schema-declared and do not carry per-field type tags.

| Physical encoding | Meaning |
| --- | --- |
| `varuint` | unsigned value encoded as Twilic-PV |
| `zigzag_varuint` | signed value zigzag-encoded, then Twilic-PV |
| `range_bits` | `value - min` encoded with schema-derived bit width |
| `fixed_le` | logical alias width, little-endian, no implicit alignment padding |

`min` and `max` are validation constraints for all encodings. They become storage parameters only for `range_bits`. Declared physical encodings must not be overridden.

## Booleans and Enums

- Boolean bit `0` means false and bit `1` means true.
- Enum code is the zero-based index in schema `enumValues` order.
- `N = 0` enum sets are invalid.
- `N = 1` consumes zero bits and reconstructs the sole value.
- Unknown enum values fail encode; decoded codes `>= N` fail decode.

## Message-Local Interning

### Keys

`key_id` values are zero-based Twilic-PV ids assigned once per top-level message in first eligible key-literal registration order. Eligible key literals are keys emitted in Dynamic map key position. Keys inside `shape_def` register only in the shape table unless later emitted as map key literals.

### String Values

`str_id` values are zero-based Twilic-PV ids assigned once per string-table scope. In Dynamic Profile, eligible literals are string values emitted in value position, excluding map keys and `shape_def` keys.

### Shapes

`shape_def` is a declaration, not a decoded application value. In arrays, `shape_def` declarations do not count toward decoded element count; `shape_ref` rows produce decoded object values.

## Typed Vector Payloads

```text
0xDA [element_type][count][codec][payload]
```

The v3 reference interoperability profile defines payload grammar for `PLAIN` and `DIRECT_BITPACK`. Other codec codes require a negotiated profile before use in interoperable payloads or benchmark claims.

For `PLAIN`, present values are encoded in element/row order:

| Value kind         | Payload per present value                           |
| ------------------ | --------------------------------------------------- |
| unsigned integer   | fixed-width little-endian logical alias width       |
| signed integer     | two's-complement fixed-width little-endian width    |
| `varuint` field    | Twilic-PV value                                     |
| `zigzag_varuint`   | zigzag then Twilic-PV                               |
| `fixed_le` field   | fixed-width little-endian logical alias width       |
| `f64`              | 64-bit little-endian IEEE 754                       |
| string             | Twilic-PV byte length followed by UTF-8 bytes       |
| binary             | Twilic-PV byte length followed by raw bytes         |
| bool               | bitstream, least-significant-bit first, zero-padded |
| enum               | fixed-width code bitstream, schema enum order       |
| `range_bits` field | fixed-width offset bitstream, field range width     |

For `DIRECT_BITPACK`, payload is:

```text
[bit_width][bitstream]
```

The bitstream emits unsigned codes least-significant-bit first in element/row order with zero padding. Signed element types use zigzag over the logical alias width before bit packing. Codes must be `< 2^bit_width`; `bit_width = 0` permits only code `0` and emits no bits.

## Bound Record Streams

For schema-shared row-wise streams, use `BOUND_STREAM` and compact record bodies:

```text
[presence bits?][fixed bit group][byte payloads...]
```

Record bodies do not carry schema id, field count, field numbers, field names, type tags, or per-field mode bytes. Fallback dynamic/literal encodings are unavailable inside Bound field payloads unless a negotiated extension changes the layout.

## Schema-Bound Batches

For columnar batches under a shared schema, use `SCHEMA_BATCH`.

- one column per schema field in schema order
- `column_count` present in the v3 reference profile
- `field_id` omitted in strict schema-order compact mode by default
- presence bitmaps use one bit per row
- typed-vector payload encodes present row values only for optional/nullable columns

## Compatibility

v3 is a clean break from v2 for Bound Profile field/record-body payloads. Dynamic Profile may retain v2-compatible tag behavior where tags are unchanged.
