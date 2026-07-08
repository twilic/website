# Troubleshooting

Common Twilic integration issues and how to resolve them.

## Decode errors

### `failed to decode v2 payload`

**Causes:** Truncated bytes, wrong format (MessagePack/JSON sent to Twilic decoder), v1 payload to v2 decoder.

**Fix:**

```bash
# Inspect bytes
cat payload.twilic | twilic decode --pretty

# Check first byte / magic
xxd payload.twilic | head -1
```

Verify producer and consumer agree on v2 and the same profile.

### `TwilicDecodeError: DECODE_DEPTH_EXCEEDED`

**Cause:** Payload nesting exceeds decode depth limit (default 64).

**Fix:** Reject malformed input. If legitimate, inspect for accidental recursive structures. Do not disable limits on untrusted input.

### `decode count limit exceeded`

**Cause:** Corrupt length prefix or malicious oversized array/map declaration.

**Fix:** Validate payload size before decode. Check for transport corruption (partial reads on TCP without length framing).

## Stateful session issues

### Patches fail after reconnect

**Cause:** Client or server lost session state.

**Fix:**

```ts
enc.reset();
socket.send(enc.encode(fullState)); // full frame first
// then resume encodePatch()
```

### `StatelessRetryRequired` / `ErrStatelessRetryRequired`

**Cause:** Decoder received patch referencing unknown base ID or shape.

**Fix:** Set `unknownReferencePolicy: "statelessRetry"` and implement full-frame retry. Or call `reset()` on producer.

### Patch size not shrinking

**Cause:** Most fields change every tick, or session was reset silently.

**Fix:** Verify with transport-JSON logging. If > 50% of fields change per tick, stateful mode may not help.

## HTTP integration issues

### 415 Unsupported Media Type

**Cause:** Request missing `Content-Type: application/vnd.twilic`.

**Fix:**

```ts
// Client
headers: { "Content-Type": "application/vnd.twilic" }

// Or relax on server (internal only)
twilicParser({ requireContentType: false })
```

### Empty or corrupt request body

**Cause:** `express.json()` consumed the stream before `twilicParser()`.

**Fix:** Isolate Twilic routes on a separate router without JSON middleware. See [Express integration](/integrations/express).

### Client receives binary gibberish

**Cause:** Client expects JSON but server sends Twilic.

**Fix:** Set `Accept: application/vnd.twilic` or use `@twilic/fetch` / `@twilic/axios`.

## JavaScript-specific

### `init()` not called

**Symptom:** Error about backend not initialized.

**Fix:**

```ts
await init(); // once at startup
```

### Precision loss on large integers

**Symptom:** IDs change after roundtrip.

**Fix:** Use `bigint`:

```ts
{
  id: 9007199254740993n;
} // not Number
```

### Wrong import path

**Symptom:** `encodeBatch is not a function` from `@twilic/core`.

**Fix:** Import batch functions from `@twilic/core/advanced`:

```ts
import { encodeBatch } from "@twilic/core/advanced";
```

## Size not improving vs MessagePack

**Causes:**

- Single non-repeating objects (expected — Twilic ≈ MessagePack)
- Batch size too small (< 10 records)
- Heterogeneous shapes mixed in one batch

**Fix:** Batch same-shape records. Measure at 50–256 records. See [Batch & Columnar](/guide/batch-and-columnar).

## Debugging tools

| Tool                            | Use                             |
| ------------------------------- | ------------------------------- |
| [Twilic CLI](/guide/cli)        | `encode` / `decode` roundtrip   |
| [Playground](/guide/playground) | Interactive size comparison     |
| `decodeToTransportJson()`       | Inspect wire content (advanced) |
| `xxd` / hex dump                | Raw byte inspection             |

```bash
echo '{"a":1}' | twilic encode | twilic decode --pretty
```

## Getting help

1. Reproduce with minimal payload via CLI
2. Note SDK language + version + profile used
3. Include encode/decode code path (main vs advanced import)
4. Open issue at [github.com/twilic/twilic](https://github.com/twilic/twilic) with redacted payload bytes

## Related

- [Errors & Limits](/reference/errors-and-limits)
- [Security](/guide/security)
- [FAQ](/guide/faq)
