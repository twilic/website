# Quick Start

Choose an SDK for your language and follow the steps below.

## Rust

Add to `Cargo.toml`:

```toml
[dependencies]
twilic = { git = "https://github.com/twilic/twilic-rust.git" }
```

Encode and decode a value:

```rust
use twilic::{decode, encode, Value};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let value = Value::Map(vec![
        ("id".to_string(), Value::U64(1001)),
        ("name".to_string(), Value::String("alice".to_string())),
        ("score".to_string(), Value::F64(98.6)),
    ]);

    let bytes = encode(&value)?;
    let decoded = decode(&bytes)?;

    assert_eq!(value, decoded);
    Ok(())
}
```

→ [Full Rust SDK docs](/sdks/rust)

## Go

Install:

```bash
go get github.com/twilic/twilic-go
```

Encode and decode a value:

```go
package main

import (
    "fmt"
    twilic "github.com/twilic/twilic-go"
)

func main() {
    value := twilic.NewMap(
        twilic.Entry("id", twilic.NewU64(1001)),
        twilic.Entry("name", twilic.NewString("alice")),
        twilic.Entry("score", twilic.NewF64(98.6)),
    )

    bytes, err := twilic.Encode(value)
    if err != nil {
        panic(err)
    }

    decoded, err := twilic.Decode(bytes)
    if err != nil {
        panic(err)
    }

    fmt.Println(decoded)
}
```

→ [Full Go SDK docs](/sdks/go)

## Python

Install:

```bash
pip install twilic
```

Or with uv:

```bash
uv add twilic
```

Encode and decode a value:

```python
import twilic

value = twilic.new_map(
    twilic.entry("id", twilic.new_u64(1001)),
    twilic.entry("name", twilic.new_string("alice")),
    twilic.entry("score", twilic.new_f64(98.6)),
)

data = twilic.encode(value)
decoded = twilic.decode(data)

assert decoded == value
```

→ [Full Python SDK docs](/sdks/python)

## JavaScript / TypeScript

Install:

```bash
npm install @twilic/core
# or
pnpm add @twilic/core
```

Encode and decode a value:

```ts
import { init, encode, decode } from "@twilic/core";

await init();

const value = {
  id: 1001n,
  name: "alice",
  score: 98.6,
};

const bytes = encode(value);
const decoded = decode(bytes);
```

→ [Full JS/TS SDK docs](/sdks/js)

## Java

Add to your build file (Maven/Gradle) or install from the local path:

```java
import io.twilic.Twilic;
import io.twilic.Value;

public class Main {
    public static void main(String[] args) throws Exception {
        Value value = Value.map(
            Value.entry("id", Value.u64(1001)),
            Value.entry("name", Value.string("alice")),
            Value.entry("score", Value.f64(98.6))
        );

        byte[] bytes = Twilic.encode(value);
        Value decoded = Twilic.decode(bytes);
    }
}
```

→ [Full Java SDK docs](/sdks/java)

## Ruby

Install:

```bash
gem install twilic
```

Encode and decode a value:

```ruby
require "twilic"

value = Twilic.new_map(
  Twilic.entry("id", Twilic.new_u64(1001)),
  Twilic.entry("name", Twilic.new_string("alice")),
  Twilic.entry("score", Twilic.new_f64(98.6))
)

data = Twilic.encode(value)
decoded = Twilic.decode(data)
```

→ [Full Ruby SDK docs](/sdks/ruby)

## Zig

Add to your `build.zig.zon` and import:

```zig
const std = @import("std");
const twilic = @import("twilic");

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    var entries = try allocator.alloc(twilic.model.ValueMapEntry, 2);
    entries[0] = .{ .key = "id", .value = .{ .U64 = 1001 } };
    entries[1] = .{ .key = "name", .value = .{ .String = "alice" } };

    const value = twilic.model.Value{ .Map = entries };
    const bytes = try twilic.encode(allocator, value);
    const decoded = try twilic.decode(allocator, bytes);
    _ = decoded;
}
```

→ [Full Zig SDK docs](/sdks/zig)
