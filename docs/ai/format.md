# `.twai` format

`.twai` is the canonical on-disk and wire container for Twilic AI sessions.

**Record once. Replay anywhere. Send less.**

**MIME type:** `application/vnd.twilic.ai+twai`  
**Normative source:** [spec/twai.md](https://github.com/twilic/ai/blob/main/spec/twai.md) in the [twilic/ai](https://github.com/twilic/ai) repository

## File layout

| Offset | Size | Field | Description |
| --: | --: | --- | --- |
| 0 | 4 | magic | ASCII `TWAI` |
| 4 | 2 | version | `u16` little-endian (currently `1`) |
| 6 | 2 | flags | `u16` little-endian, reserved (`0`) |
| 8 | 4 | headerLen | `u32` LE length of header blob |
| 12 | headerLen | header | Twilic-encoded `SessionMeta` |
| 12+headerLen | 4 | bodyLen | `u32` LE length of body blob |
| 16+headerLen | bodyLen | body | Twilic-encoded `{ events: AIEvent[] }` |

## SessionMeta

```json
{
  "format": "twai",
  "version": 1,
  "sessionId": "uuid",
  "createdAt": 1700000000000,
  "completedAt": 1700000007000,
  "provider": "openai",
  "model": "gpt-4.1",
  "eventCount": 42,
  "source": "recorder"
}
```

## AIEvent

Each event is a JSON-compatible object with:

- `type` — e.g. `session.start`, `text.delta`, `tool.output`
- `sequence` — monotonic index within the session
- `timestamp` — epoch milliseconds
- `sessionId` — owning session
- optional correlation: `responseId`, `itemId`, `toolCallId`, `model`, `provider`
- `data` — payload (text, args, usage, etc.)
- `extensions` — provider-specific metadata

## Encoding requirements

1. Call `init()` / `ensureTwilicInit()` from `@twilic/core` / `@twilic/ai` before encode or decode.
2. Encode header and body separately with stateless Twilic encode.
3. Preserve event order in the body array.

## Reference implementation

`@twilic/ai` provides `encodeTwai`, `decodeTwai`, `readSession`, and `writeSession`. See [Core](/ai/core).

## Related

- [Twilic AI overview](/ai/)
- [CLI `ai` commands](/guide/cli#ai)
- [Twilic wire format](/spec/overview)
