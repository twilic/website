# Errors & Decode Limits

Twilic decoders enforce safety limits on untrusted or malformed input. Understanding these limits is essential for production deployments at trust boundaries.

## TwilicDecodeError (JavaScript)

```ts
class TwilicDecodeError extends Error {
  readonly name = "TwilicDecodeError";
  readonly code = "DECODE_DEPTH_EXCEEDED";
}

const DEFAULT_MAX_DECODE_DEPTH = 64;

function decodeDepthLimitMessage(maxDepth: number): string;
```

Thrown when nested structure exceeds the decode depth limit during `decode()`.

## Rust error types

```rust
pub enum TwilicError {
    DecodeDepthLimitExceeded,
    DecodeCountLimitExceeded,
    DecodeOutputRatioExceeded,
    StatelessRetryRequired(&'static str, u64),
    UnknownReference(/* ... */),
    // ...
}
```

## Wire decode constants (Rust)

```rust
pub const DEFAULT_MAX_DECODE_COUNT: u64;
pub const DEFAULT_MAX_DECODE_OUTPUT_RATIO: u64;
```

| Limit | Purpose |
| --- | --- |
| **Decode depth** | Prevents stack exhaustion from deeply nested arrays/maps |
| **Decode count** | Prevents allocation bombs from huge declared array/map lengths |
| **Output ratio** | Prevents decompression bombs (small input → huge output) |

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
- Reject oversized bodies at the reverse proxy or framework level
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
