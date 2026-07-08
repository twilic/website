# SDKs

Twilic has production-ready implementations in eighteen languages. All SDKs target the [v2 wire format](/spec/overview) and share a consistent API surface.

## Documentation

| Resource | Description |
| --- | --- |
| [API Reference](/reference/) | Complete function signatures for JS, Rust, Python, Go |
| [Integrations](/integrations/) | HTTP packages for Hono, Express, Fastify, Fetch, Axios |
| [Encoding Profiles](/guide/encoding-profiles) | Dynamic, Batch, Bound, Stateful |
| [Quick Start](/guide/quick-start) | Install and first encode in every language |

## Available SDKs

| Language | Package | Requirements |
| --- | --- | --- |
| [Rust](/sdks/rust) | `twilic` (crates.io) | Rust stable (edition 2024) |
| [Go](/sdks/go) | `github.com/twilic/twilic-go` | Go 1.22+ |
| [Python](/sdks/python) | `twilic` (PyPI) | Python 3.12+ |
| [JavaScript / TypeScript](/sdks/js) | `@twilic/core` | Node.js 24+ / WASM |
| [Java](/sdks/java) | `io.twilic` | Java 21+ |
| [Scala](/sdks/scala) | `io.twilic` (GitHub) | Java 21+ / Scala 3.3+ |
| [Ruby](/sdks/ruby) | `twilic` (RubyGems) | Ruby 3.3+ |
| [R](/sdks/r) | `twilic` (GitHub) | R 4.4+ |
| [Zig](/sdks/zig) | `twilic` (build.zig.zon) | Zig 0.15.2+ |
| [PHP](/sdks/php) | `twilic/twilic` (GitHub) | PHP 8.3+ |
| [Kotlin](/sdks/kotlin) | `io.twilic:twilic` (GitHub) | JDK 21+ |
| [Dart](/sdks/dart) | `twilic` (GitHub) | Dart SDK 3.5+ |
| [Elixir](/sdks/elixir) | `:twilic` (GitHub) | Elixir 1.19+ / OTP 27+ |
| [Lua](/sdks/lua) | `twilic` (GitHub / LuaRocks) | Lua 5.4 |
| [C](/sdks/c) | `twilic-c` (GitHub) | CMake 3.16+ / C11 |
| [C++](/sdks/cpp) | `twilic-cpp` (GitHub) | CMake 3.16+ / C++17 |
| [C#](/sdks/csharp) | `Twilic` (GitHub) | .NET 8 SDK |
| [Swift](/sdks/swift) | `Twilic` (SPM) | Swift 5.9+ |

## Common API Surface

All SDKs expose the same logical operations:

| Operation | Description | Reference |
| --- | --- | --- |
| `encode(value)` | Dynamic profile encode | [Profiles](/guide/encoding-profiles) |
| `decode(bytes)` | Decode to value | [Errors & Limits](/reference/errors-and-limits) |
| `encode_with_schema(value, schema)` | Bound profile encode | [Schema-Bound](/guide/schema-bound) |
| `encode_batch(records)` | Same-shape batch | [Batch & Columnar](/guide/batch-and-columnar) |
| `SessionEncoder` | Stateful stream encoder | [Session Encoder](/reference/session-encoder) |

## JavaScript entrypoints

| Import                  | Use                                                |
| ----------------------- | -------------------------------------------------- |
| `@twilic/core`          | `init`, `encode`, `decode`, `createSessionEncoder` |
| `@twilic/core/advanced` | `encodeBatch`, `encodeWithSchema`, transport-JSON  |

See [JavaScript Core API](/reference/javascript-core) and [Advanced API](/reference/javascript-advanced).

## Rust (Reference Implementation)

The [JavaScript SDK](/sdks/js) is built on the Rust implementation via N-API and WASM. Full low-level API: [Rust reference](/reference/rust).

## Interoperability

All SDKs are tested against shared binary fixtures. Any v2 encoder output decodes in any v2 SDK. See [Interop guide](/guide/interop).
