# SDKs

Twilic has production-ready implementations in fourteen languages. All SDKs target the [v2 wire format](/spec/overview) and share a consistent API surface.

## Available SDKs

| Language | Package | Requirements |
| --- | --- | --- |
| [Rust](/sdks/rust) | `twilic` (crates.io) | Rust stable (edition 2024) |
| [Go](/sdks/go) | `github.com/twilic/twilic-go` | Go 1.22+ |
| [Python](/sdks/python) | `twilic` (PyPI) | Python 3.12+ |
| [JavaScript / TypeScript](/sdks/js) | `@twilic/core` | Node.js 24+ / WASM |
| [Java](/sdks/java) | `io.twilic` | Java 21+ |
| [Ruby](/sdks/ruby) | `twilic` (RubyGems) | Ruby 3.3+ |
| [Zig](/sdks/zig) | `twilic` (build.zig.zon) | Zig 0.15.2+ |
| [PHP](/sdks/php) | `twilic/twilic` (GitHub) | PHP 8.3+ |
| [Kotlin](/sdks/kotlin) | `io.twilic:twilic` (GitHub) | JDK 21+ |
| [Dart](/sdks/dart) | `twilic` (GitHub) | Dart SDK 3.5+ |
| [Elixir](/sdks/elixir) | `:twilic` (GitHub) | Elixir 1.19+ / OTP 27+ |
| [C++](/sdks/cpp) | `twilic-cpp` (GitHub) | CMake 3.16+ / C++17 |
| [C#](/sdks/csharp) | `Twilic` (GitHub) | .NET 8 SDK |
| [Swift](/sdks/swift) | `Twilic` (SPM) | Swift 5.9+ |

## Common API Surface

All SDKs expose the same logical operations:

| Operation | Description |
| --- | --- |
| `encode(value)` | Encode a value to Twilic v2 bytes (Dynamic Profile) |
| `decode(bytes)` | Decode Twilic v2 bytes to a value |
| `encode_with_schema(value, schema)` | Encode using Bound Profile |
| `encode_batch(records)` | Encode a batch of same-shape records |
| `SessionEncoder` | Stateful encoder for long-lived streams |

## Rust (Reference Implementation)

The [JavaScript SDK](/sdks/js) is built on top of the Rust implementation via N-API (Node.js) and WASM (browser/JS runtimes). The Rust crate is the canonical reference implementation for performance and correctness.

## Interoperability

All SDKs are tested against a shared set of Rust-generated binary fixtures. Interoperability tests validate that encode output from one SDK is correctly decoded by every other SDK.
