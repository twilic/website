# C SDK

The C library provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- CMake 3.16 or later
- C11-capable compiler
- C++17 compiler (internal implementation sources compile as C++17 today while the C11 port proceeds)

## Install

Clone and build from source:

```bash
git clone https://github.com/twilic/twilic-c.git
cd twilic-c
cmake -B build -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_C_FLAGS="-Wall -Wextra -Werror" \
  -DCMAKE_CXX_FLAGS="-Wall -Wextra -Werror"
cmake --build build
```

Add `include/` to your include path and link against the built library.

## Quick Start

```c
#include "twilic/twilic.h"

twilic_map_entry_t entries[] = {
    twilic_entry("id", twilic_u64(1001)),
    twilic_entry("name", twilic_string("alice")),
    twilic_entry("score", twilic_f64(98.6)),
};
twilic_value_t value = twilic_map(entries, 3);

twilic_buffer_t encoded = {0};
twilic_error_t err = {0};
if (twilic_encode(&value, &encoded, &err) != 0) { /* handle err */ }

twilic_value_t decoded = twilic_null();
twilic_decode(encoded.data, encoded.len, &decoded, &err);

twilic_value_free(&decoded);
twilic_value_free(&value);
twilic_buffer_free(&encoded);
```

## API Reference

### Dynamic Encoding

```c
int twilic_encode(const twilic_value_t *value, twilic_buffer_t *out, twilic_error_t *err);
int twilic_decode(const uint8_t *data, size_t len, twilic_value_t *out, twilic_error_t *err);
```

### Schema-Aware Encoding

```c
int twilic_encode_with_schema(const twilic_value_t *value, const twilic_schema_t *schema,
                              twilic_buffer_t *out, twilic_error_t *err);
```

### Batch Encoding

```c
int twilic_encode_batch(const twilic_value_t *records, size_t count,
                        twilic_buffer_t *out, twilic_error_t *err);
```

## Value Model

Values are represented as `twilic_value_t` tagged unions with constructors such as `twilic_u64`, `twilic_string`, `twilic_map`, and `twilic_array`. Call `twilic_value_free` when done.

## Project Layout

```text
twilic-c/
  include/twilic/   # public twilic.h + internal headers
  src/              # wire, model, codec, session, protocol, v2
  test/             # ctest spec harness
  tools/            # Rust interop emit/decode CLIs
  scripts/          # interop smoke checks
```

## Source

[github.com/twilic/twilic-c](https://github.com/twilic/twilic-c)
