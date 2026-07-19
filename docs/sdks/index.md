# SDKs

Twilic has production-ready implementations in eighteen languages. The current specification family is [v3](/spec/v3). Rust, Go, JavaScript, and Zig ship v3 by default; other SDKs remain on the v2 interop line until their v3 support lands. All SDKs share a consistent API surface.

## Documentation

| Resource | Description |
| --- | --- |
| [API Reference](/reference/) | Complete function signatures for JS, Rust, Python, Go |
| [Integrations](/integrations/) | HTTP packages for Hono, Express, Fastify, Fetch, Axios |
| [Encoding Profiles](/guide/encoding-profiles) | Dynamic, Batch, Bound, Stateful |
| [Quick Start](/guide/quick-start) | Install and first encode in every language |

## Available SDKs

| Language | Package | Wire line | Requirements |
| --- | --- | --- | --- |
| [Rust](/sdks/rust) | `twilic` (crates.io) | **v3** | Rust stable (edition 2024) |
| [Go](/sdks/go) | `github.com/twilic/twilic-go` | **v3** | Go 1.22+ |
| [JavaScript / TypeScript](/sdks/js) | `@twilic/core` | **v3** | Node.js 24+ / WASM |
| [Zig](/sdks/zig) | `twilic` (build.zig.zon) | **v3** | Zig 0.16.0+ |
| [Python](/sdks/python) | `twilic` (PyPI) | v2 | Python 3.12+ |
| [Java](/sdks/java) | `io.twilic` | v2 | Java 21+ |
| [Scala](/sdks/scala) | `io.twilic` (GitHub) | v2 | Java 21+ / Scala 3.3+ |
| [Ruby](/sdks/ruby) | `twilic` (RubyGems) | v2 | Ruby 3.3+ |
| [R](/sdks/r) | `twilic` (GitHub) | v2 | R 4.4+ |
| [PHP](/sdks/php) | `twilic/twilic` (GitHub) | v2 | PHP 8.3+ |
| [Kotlin](/sdks/kotlin) | `io.twilic:twilic` (GitHub) | v2 | JDK 21+ |
| [Dart](/sdks/dart) | `twilic` (GitHub) | v2 | Dart SDK 3.5+ |
| [Elixir](/sdks/elixir) | `:twilic` (GitHub) | v2 | Elixir 1.19+ / OTP 27+ |
| [Lua](/sdks/lua) | `twilic` (GitHub / LuaRocks) | v2 | Lua 5.4 |
| [C](/sdks/c) | `twilic-c` (GitHub) | v2 | CMake 3.16+ / C11 |
| [C++](/sdks/cpp) | `twilic-cpp` (GitHub) | v2 | CMake 3.16+ / C++17 |
| [C#](/sdks/csharp) | `Twilic` (GitHub) | v2 | .NET 8 SDK |
| [Swift](/sdks/swift) | `Twilic` (SPM) | v2 | Swift 5.9+ |

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

v3 SDKs (Rust, Go, JavaScript, Zig) interoperate on the v3 reference profile, including `BOUND_STREAM` and `SCHEMA_BATCH`. v2 SDKs interoperate on the v2 fixture line. Mix v2 and v3 only when both sides agree on version and profile. See [Interop guide](/guide/interop).
