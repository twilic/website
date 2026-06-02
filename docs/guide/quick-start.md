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

## Scala

Add to `build.sbt`:

```scala
libraryDependencies += "io.twilic" %% "twilic" % "3.0.0"
```

```scala
import io.twilic.Twilic
import io.twilic.internal.core.*

val value = Twilic.newMap(
  Twilic.entry("id", Twilic.newU64(1001)),
  Twilic.entry("name", Twilic.newString("alice")),
)

val bytes = Twilic.encode(value)
val decoded = Twilic.decode(bytes)
```

→ [Full Scala SDK docs](/sdks/scala)

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

## R

Install from source:

```bash
git clone https://github.com/twilic/twilic-r.git
cd twilic-r && R CMD INSTALL .
```

```r
library(twilic)

value <- new_map(
  entry("id", new_u64(1001)),
  entry("name", new_string("alice"))
)

bytes <- encode(value)
decoded <- decode(bytes)
```

→ [Full R SDK docs](/sdks/r)

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

## PHP

Install with Composer (from GitHub until Packagist):

```bash
composer require twilic/twilic:@dev
```

```php
<?php
require 'vendor/autoload.php';

use function Twilic\{decode, encode, entry, new_map, new_string, new_u64};

$value = new_map(
    entry('id', new_u64(1001)),
    entry('name', new_string('alice')),
);
$data = encode($value);
$decoded = decode($data);
```

→ [Full PHP SDK docs](/sdks/php)

## Kotlin

Add from GitHub (Maven Central when published):

```kotlin
dependencies {
    implementation("io.twilic:twilic:3.0.0")
}
```

```kotlin
import io.twilic.Twilic
import io.twilic.internal.core.MapEntry

val value = Twilic.newMap(
    MapEntry("id", Twilic.newU64(1001)),
    MapEntry("name", Twilic.newString("alice")),
)
val encoded = Twilic.encode(value)
val decoded = Twilic.decode(encoded)
```

→ [Full Kotlin SDK docs](/sdks/kotlin)

## Dart

Add to `pubspec.yaml`:

```yaml
dependencies:
  twilic:
    git:
      url: https://github.com/twilic/twilic-dart.git
```

```dart
import 'package:twilic/twilic.dart';

final value = newMap([
  entry('id', newU64(1001)),
  entry('name', newString('alice')),
]);
final bytes = encode(value);
final decoded = decode(bytes);
```

→ [Full Dart SDK docs](/sdks/dart)

## Elixir

Add to `mix.exs`:

```elixir
{:twilic, git: "https://github.com/twilic/twilic-elixir.git"}
```

```elixir
value =
  Twilic.new_map([
    Twilic.entry("id", Twilic.new_u64(1001)),
    Twilic.entry("name", Twilic.new_string("alice")),
  ])

encoded = Twilic.encode(value)
decoded = Twilic.decode(encoded)
```

→ [Full Elixir SDK docs](/sdks/elixir)

## Lua

Install via LuaRocks or set `LUA_PATH` to the source tree:

```bash
git clone https://github.com/twilic/twilic-lua.git
cd twilic-lua
export LUA_PATH="$(pwd)/src/?.lua;$(pwd)/src/?/init.lua;;"
```

```lua
local twilic = require("twilic")

local value = twilic.map({
  id = twilic.u64(1001),
  name = twilic.string("alice"),
})

local bytes = twilic.encode(value)
local decoded = twilic.decode(bytes)
```

→ [Full Lua SDK docs](/sdks/lua)

## C

Build from source:

```bash
git clone https://github.com/twilic/twilic-c.git
cd twilic-c && cmake -B build && cmake --build build
```

```c
#include "twilic/twilic.h"

twilic_map_entry_t entries[] = {
    twilic_entry("id", twilic_u64(1001)),
    twilic_entry("name", twilic_string("alice")),
};
twilic_value_t value = twilic_map(entries, 2);

twilic_buffer_t encoded = {0};
twilic_error_t err = {0};
twilic_encode(&value, &encoded, &err);
```

→ [Full C SDK docs](/sdks/c)

## C++

Build from source:

```bash
git clone https://github.com/twilic/twilic-cpp.git
cd twilic-cpp && cmake -B build && cmake --build build
```

```cpp
#include "twilic/twilic.hpp"

auto value = twilic::new_map({
    twilic::entry("id", twilic::new_u64(1001)),
    twilic::entry("name", twilic::new_string("alice")),
});
auto bytes = twilic::encode(value);
auto decoded = twilic::decode(bytes);
```

→ [Full C++ SDK docs](/sdks/cpp)

## C Sharp

Clone and build:

```bash
git clone https://github.com/twilic/twilic-csharp.git
cd twilic-csharp && dotnet build
```

```csharp
using Twilic;

var value = Twilic.NewMap(
    Twilic.Entry("id", Twilic.NewU64(1001)),
    Twilic.Entry("name", Twilic.NewString("alice")));
byte[] bytes = Twilic.Encode(value);
var decoded = Twilic.Decode(bytes);
```

→ [Full C# SDK docs](/sdks/csharp)

## Swift

Add to `Package.swift`:

```swift
.package(url: "https://github.com/twilic/twilic-swift.git", from: "0.1.0"),
```

```swift
import Twilic

let value = newMap([
    entry("id", newU64(1001)),
    entry("name", newString("alice")),
])
let data = try encode(value)
let decoded = try decode(data)
```

→ [Full Swift SDK docs](/sdks/swift)

See the [SDK overview](/sdks/) for requirements, packages, and interoperability notes for all eighteen languages.
