# Zig SDK

The Zig package provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and session encoding.

## Requirements

- Zig 0.15.2 (minimum 0.15.0)

## Install

Add to `build.zig.zon`:

```zig
.{
    .name = "my-project",
    .version = "0.1.0",
    .dependencies = .{
        .twilic = .{
            .url = "https://github.com/twilic/twilic-zig/archive/refs/heads/main.tar.gz",
        },
    },
}
```

Then in `build.zig`:

```zig
const twilic = b.dependency("twilic", .{ .target = target, .optimize = optimize });
exe.root_module.addImport("twilic", twilic.module("twilic"));
```

## Quick Start

```zig
const std = @import("std");
const twilic = @import("twilic");

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    var entries = try allocator.alloc(twilic.model.ValueMapEntry, 2);
    entries[0] = .{
        .key = try allocator.dupe(u8, "id"),
        .value = .{ .U64 = 1001 },
    };
    entries[1] = .{
        .key = try allocator.dupe(u8, "name"),
        .value = .{ .String = try allocator.dupe(u8, "alice") },
    };

    const value = twilic.model.Value{ .Map = entries };

    const bytes = try twilic.encode(allocator, value);
    defer allocator.free(bytes);

    const decoded = try twilic.decode(allocator, bytes);
    defer decoded.deinit(allocator);

    std.debug.print("encoded {} bytes\n", .{bytes.len});
}
```

## API Reference

### Dynamic Encoding

```zig
// Encode any Value to a byte slice (caller owns result)
pub fn encode(allocator: Allocator, value: Value) ![]u8

// Decode bytes to a Value (caller owns result)
pub fn decode(allocator: Allocator, bytes: []const u8) !Value
```

### Schema-Aware Encoding

```zig
// Encode using a session encoder with schema
pub fn SessionEncoder.encodeWithSchema(self: *SessionEncoder, value: Value, schema: Schema) ![]u8
```

### Batch Encoding

```zig
// Encode a slice of same-shape records
pub fn SessionEncoder.encodeBatch(self: *SessionEncoder, records: []Value) ![]u8
```

### Session Encoder

```zig
var enc = twilic.SessionEncoder.init(allocator);
defer enc.deinit();

// Encode with session state
const bytes = try enc.encode(value);
defer allocator.free(bytes);

// Reset session state
enc.reset();
```

## Value Model

```zig
pub const Value = union(enum) {
    Null,
    Bool: bool,
    U8: u8,
    U16: u16,
    U32: u32,
    U64: u64,
    I8: i8,
    I16: i16,
    I32: i32,
    I64: i64,
    F64: f64,
    String: []const u8,
    Binary: []const u8,
    Array: []Value,
    Map: []ValueMapEntry,
};

pub const ValueMapEntry = struct {
    key: []const u8,
    value: Value,
};
```

## Vector Codecs

The Zig SDK implements all required v2 column codecs:

- `Simple8b` — packs multiple small integers per 64-bit word
- `RLE` — run-length encoding
- `FOR` / direct bitpack — frame-of-reference
- `XOR_FLOAT` — XOR of adjacent floats + bitpack
- `DELTA_BITPACK`, `FOR_BITPACK`, `DELTA_FOR_BITPACK`

## Project Layout

```text
twilic-zig/
  src/           # wire, model, codec, session, protocol, v2
  tests/         # spec conformance and interop tests
  scripts/       # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-zig](https://github.com/twilic/twilic-zig)
