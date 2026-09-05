# Errors & Decode Limits

Twilic decoders enforce safety limits on untrusted or malformed input. Understanding these limits is essential for production deployments at trust boundaries.

## TwilicDecodeError (JavaScript)

```ts
class TwilicDecodeError extends Error {
  readonly name = "TwilicDecodeError";
  readonly code: "DECODE_DEPTH_EXCEEDED" | "DECODE_LIMIT_EXCEEDED";
}

const DEFAULT_MAX_DECODE_DEPTH = 64;

function decodeDepthLimitMessage(maxDepth: number): string;
```

Thrown when `decode()` exceeds its nesting or collection/output budget. Errors outside these categories retain their original type.

## Rust error types

```rust
pub enum TwilicError {
    InvalidData(&'static str),
    StatelessRetryRequired(&'static str, u64),
    UnknownReference(&'static str, u64),
    // ...
}
```

## Wire decode constants (Rust)

```rust
pub const DEFAULT_MAX_DECODE_COUNT: usize = 1 << 20;
pub const DEFAULT_MAX_DECODE_OUTPUT_RATIO: usize = 1 << 10;
```

| Limit | Purpose |
| --- | --- |
| **Decode depth** | Prevents stack exhaustion from deeply nested arrays/maps |
| **Decode count** | Prevents allocation bombs from huge declared array/map lengths |
| **Output ratio** | Prevents decompression bombs (small input → huge output) |

## Current source coverage

| Implementation/API | Limits added or extended |
| --- | --- |
| Rust session `decode_message` / `decode_value` | Shared depth checks for nested values and messages; failed message decoding does not commit state |
| JavaScript fast and N-API decoders | Collection lengths, shape ID/key bounds and cumulative collection budget; normalized limit error codes |
| C/C++, Go, Python, Java/Kotlin/Scala, Ruby, PHP, Lua, R, Dart, Elixir | Reader length/count checks, nesting checks and cumulative vector/container budget on the implemented decoding paths |
| Swift | v2 depth/shape checks, checked wire lengths, vector budget; session protocol remains unsupported |
| C# | v2 depth/shape and reader bounds; no claim about unsupported vector/session APIs |
| Zig | Varuint termination, reader bounds, session recursion and vector counts |

Reader budgets use `min(inputBytes * 1024, 1_048_576)` accounting units. Collection slots and numeric values usually cost eight units; some paths also charge metadata or copied strings. Shape definitions are limited to IDs 0–65,535 and at most 256 keys where the v2 shape format is implemented. Nesting is bounded at 64 guarded frames; session message envelopes also consume depth, so this is not an identical number of array levels across APIs.

These are conservative accounting limits, **not an exact heap-memory ceiling**. Input buffers, strings, runtime object overhead, persistent session state and independent nested readers can consume additional memory. Cap input size and session lifetime separately. Some otherwise valid large or highly compressed messages that older versions accepted now fail; split them into smaller frames. The wire format is unchanged. Update/rebuild the relevant package and native/WASM artifacts to receive these changes.

## Untrusted input guidelines

Twilic is designed for **internal, trusted** pipelines by default. At boundaries where bytes come from external users or compromised peers:

1. **Set maximum payload size** before calling decode
2. **Never decode typeless or dynamically typed payloads** from untrusted sources without an allowlist
3. **Keep public APIs on JSON** or governed Protobuf
4. **Apply session state only on authenticated channels**
5. **Monitor decode error rates** — spikes may indicate attack or state drift

## StatelessRetryRequired

When `unknownReferencePolicy` is `statelessRetry` and the decoder encounters an unknown base ID, shape reference, or dictionary ID:

```text
TwilicError::StatelessRetryRequired("base_id", 777)
```

The receiver should:

1. Discard session state
2. Request or wait for a full stateless frame
3. Resume patching after baseline is re-established

## Security at HTTP boundaries

Integration packages (`@twilic/hono`, etc.) decode request bodies. Treat this as a security boundary:

- Authenticate requests before decode
- Express and Hono parsers now default to a 1 MiB streaming body limit; set `limit` explicitly when required and keep reverse-proxy limits
- Use `requireContentType: true` (default) to reject unexpected media types

```ts
// Hono — reject non-Twilic Content-Type (default)
app.post("/data", twilicParser(), handler);

// Allow any Content-Type (use with caution)
app.post("/data", twilicParser({ requireContentType: false }), handler);
```

## Debugging decode failures

| Symptom                       | Likely cause                               |
| ----------------------------- | ------------------------------------------ |
| `DECODE_DEPTH_EXCEEDED`       | Deeply nested or malicious payload         |
| `decode count limit exceeded` | Corrupt length prefix or attack            |
| `StatelessRetryRequired`      | Client/server state drift — call `reset()` |
| `failed to decode payload`    | Wrong format version or truncated bytes    |
| HTTP 413                      | Body exceeds the configured byte limit     |
| HTTP 415                      | Missing or wrong `Content-Type` header     |

Use the [Twilic CLI](/guide/cli) to inspect bytes:

```bash
cat payload.twilic | twilic decode --pretty
```

Or decode to transport JSON (JavaScript advanced):

```ts
import { decodeToTransportJson } from "@twilic/core/advanced";
console.log(decodeToTransportJson(bytes));
```

## Related

- [Security guide](/guide/security)
- [Troubleshooting](/guide/troubleshooting)
- [Spec — v3 Reference Profile](/spec/v3)
- [Spec — v2 Legacy Reference Profile](/spec/v2)
