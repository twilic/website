# Lua SDK

The Lua module provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and session encoding.

## Requirements

- Lua 5.4
- [LuaRocks](https://luarocks.org/) (optional, for development and install)

## Install

Via LuaRocks:

```bash
luarocks install twilic-3.0.0-1.rockspec
```

Or use the source tree directly:

```bash
export LUA_PATH="$(pwd)/src/?.lua;$(pwd)/src/?/init.lua;;"
```

## Quick Start

```lua
local twilic = require("twilic")

local value = twilic.map({
  id = twilic.u64(1001),
  name = twilic.string("alice"),
  score = twilic.f64(98.6),
})

local bytes = twilic.encode(value)
local decoded = twilic.decode(bytes)
print(twilic.equal(decoded, value)) -- true
```

## API Reference

### Dynamic Encoding

```lua
twilic.encode(value)   -- string (binary bytes)
twilic.decode(bytes)   -- value
```

### Schema-Aware Encoding

```lua
codec:encode_with_schema(value, schema)
```

### Batch Encoding

```lua
codec:encode_batch(records)
```

### Session Encoder

```lua
local enc = twilic.new_session_encoder()
local bytes = enc:encode(value)
enc:reset()
```

Stateful protocol features use `twilic.new_twilic_codec()` and `twilic.new_session_encoder()`.

## Value Model

Values are Lua tables tagged by metatables. Constructors include `twilic.u64`, `twilic.string`, `twilic.map`, and `twilic.array`.

## Project Layout

```text
twilic-lua/
  src/twilic/       # public API and core modules
  spec/             # busted spec tests
  bin/              # Rust interop CLI scripts
  scripts/          # interop smoke checks
```

## Source

[github.com/twilic/twilic-lua](https://github.com/twilic/twilic-lua)
