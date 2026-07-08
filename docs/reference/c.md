# C API Reference

The C library (`twilic-c`) exposes a C11 public API for Dynamic, Bound, and Batch encoding. Session-aware APIs are in progress; the implementation is algorithmically aligned with [twilic-cpp](https://github.com/twilic/twilic-cpp).

## Installation

Build from source with CMake:

```bash
git clone https://github.com/twilic/twilic-c.git
cd twilic-c
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
sudo cmake --install build
```

## Quick start

```c
#include "twilic/twilic.h"

twilic_map_entry_t entries[] = {
    twilic_entry("id", twilic_u64(1001)),
    twilic_entry("name", twilic_string("alice")),
};
twilic_value_t value = twilic_map(entries, 2);

twilic_buffer_t encoded = {0};
twilic_error_t err = {0};

if (twilic_encode(&value, &encoded, &err) != 0) {
    fprintf(stderr, "encode: %s\n", err.msg);
    return 1;
}

twilic_value_t decoded = twilic_null();
twilic_decode(encoded.data, encoded.len, &decoded, &err);

twilic_value_free(&decoded);
twilic_value_free(&value);
twilic_buffer_free(&encoded);
```

## Core functions

| Function | Description |
| --- | --- |
| `twilic_encode(value, out, err)` | Dynamic profile encode |
| `twilic_decode(data, len, out, err)` | Dynamic profile decode |
| `twilic_encode_with_schema(schema, value, out, err)` | Bound profile encode |
| `twilic_encode_batch(values, count, out, err)` | Row batch encode |

## Value constructors

| Function                      | Type             |
| ----------------------------- | ---------------- |
| `twilic_null()`               | null             |
| `twilic_bool(bool)`           | boolean          |
| `twilic_i64(int64_t)`         | signed integer   |
| `twilic_u64(uint64_t)`        | unsigned integer |
| `twilic_f64(double)`          | float            |
| `twilic_string(const char *)` | string (copied)  |
| `twilic_binary(data, len)`    | binary (copied)  |
| `twilic_array(items, count)`  | array            |
| `twilic_map(entries, count)`  | map              |
| `twilic_entry(key, value)`    | map entry helper |

## Memory management

All heap-allocated values and buffers must be freed explicitly:

```c
twilic_value_free(&value);   // recursive — frees nested arrays/maps
twilic_buffer_free(&buffer); // encoded output
```

Do not free string/binary pointers inside a `twilic_value_t` directly — use `twilic_value_free`.

## Schema (Bound profile)

```c
twilic_schema_field_t fields[] = {
    { .number = 1, .name = "id", .logical_type = "u64", .required = true },
    { .number = 2, .name = "name", .logical_type = "string", .required = true },
};

twilic_schema_t schema = {
    .schema_id = 1,
    .name = "UserRecordV1",
    .fields = fields,
    .fields_len = 2,
};

twilic_encode_with_schema(&schema, &value, &encoded, &err);
```

## Error handling

Functions return `0` on success, non-zero on failure. Inspect `twilic_error_t`:

| Kind | Constant | Meaning |
| --- | --- | --- |
| Unexpected EOF | `TWILIC_ERR_UNEXPECTED_EOF` | Truncated payload |
| Invalid kind | `TWILIC_ERR_INVALID_KIND` | Corrupt wire data |
| Invalid tag | `TWILIC_ERR_INVALID_TAG` | Unknown tag byte |
| Invalid data | `TWILIC_ERR_INVALID_DATA` | Semantic error |
| UTF-8 | `TWILIC_ERR_UTF8` | Invalid string |
| Unknown reference | `TWILIC_ERR_UNKNOWN_REFERENCE` | Missing session base |
| Stateless retry | `TWILIC_ERR_STATELESS_RETRY_REQUIRED` | Request full frame |

```c
if (twilic_decode(data, len, &out, &err) != 0) {
    fprintf(stderr, "decode failed: %s (kind=%d)\n", err.msg, err.kind);
}
```

## Batch encoding

```c
twilic_value_t records[256];
// ... fill records ...

twilic_buffer_t batch = {0};
twilic_error_t err = {0};
twilic_encode_batch(records, 256, &batch, &err);

for (size_t i = 0; i < 256; i++) {
    twilic_value_free(&records[i]);
}
twilic_buffer_free(&batch);
```

## Interop

Cross-language fixtures are verified against Rust and Go:

```bash
./scripts/check-interop.sh
```

## C++ note

Internal sources currently compile as C++17 for parity with twilic-cpp while the mechanical C11 port proceeds. The public header `twilic.h` is pure C11 — C++ projects can link the same library. For idiomatic C++ APIs, see [twilic-cpp](https://github.com/twilic/twilic-cpp).

## Related

- [Value & Schema](/reference/value-and-schema)
- [Errors & Limits](/reference/errors-and-limits)
- [Interop guide](/guide/interop)
- [C SDK overview](/sdks/c)
