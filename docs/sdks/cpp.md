# C++ SDK

The C++ library provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- CMake 3.16 or later
- C++17 compiler

## Install

Clone and build from source:

```bash
git clone https://github.com/twilic/twilic-cpp.git
cd twilic-cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

Link against the built library and add `include/` to your include path.

## Quick Start

```cpp
#include "twilic/twilic.hpp"

auto value = twilic::new_map({
    twilic::entry("id", twilic::new_u64(1001)),
    twilic::entry("name", twilic::new_string("alice")),
    twilic::entry("score", twilic::new_f64(98.6)),
});
auto bytes = twilic::encode(value);
auto decoded = twilic::decode(bytes);
```

## API Reference

### Dynamic Encoding

```cpp
twilic::encode(value);  // std::vector<uint8_t>
twilic::decode(bytes);  // Value
```

### Schema-Aware Encoding

```cpp
twilic::encode_with_schema(value, schema);
```

### Batch Encoding

```cpp
twilic::encode_batch(records);
```

## Project Layout

```text
twilic-cpp/
  include/twilic/        # public headers
  src/                   # implementation
  test/
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-cpp](https://github.com/twilic/twilic-cpp)
