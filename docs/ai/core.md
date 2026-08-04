# @twilic/ai

Core library for recording, encoding, replaying, and inspecting Twilic AI sessions.

**Package:** `@twilic/ai`  
**Peer dependency:** `@twilic/core`  
**Source:** [github.com/twilic/ai](https://github.com/twilic/ai)

## Install

```bash
pnpm add @twilic/ai @twilic/core
```

## Quick start

```ts
import {
  createAIPlayer,
  createAIRecorder,
  ensureTwilicInit,
  inspectSession,
  writeSession,
} from "@twilic/ai";

await ensureTwilicInit();

const sessionId = "demo-session";
const recorder = createAIRecorder({
  sessionId,
  meta: { provider: "openai", model: "gpt-4.1" },
});

recorder.append({
  type: "text.delta",
  sequence: 0,
  timestamp: Date.now(),
  sessionId,
  data: { delta: "Hello" },
});

const session = {
  meta: {
    format: "twai" as const,
    version: 1 as const,
    sessionId,
    createdAt: Date.now(),
    eventCount: recorder.events.length,
  },
  events: recorder.events,
};

await writeSession("session.twai", session);
console.log(inspectSession(session));

for await (const event of createAIPlayer(session)) {
  console.log(event.type, event.data);
}
```

## Exports

### Lifecycle

| Export | Description |
| --- | --- |
| `ensureTwilicInit()` | Initialize `@twilic/core` (required before encode/decode) |
| `isTwilicInitialized()` | Whether Twilic init has completed |

### Session I/O

| Export | Description |
| --- | --- |
| `encodeTwai(session)` / `decodeTwai(bytes)` | Encode or decode a `.twai` buffer |
| `readSession(path)` / `writeSession(path, session)` | Read or write a `.twai` file |
| `sessionFromEvents(events, options?)` | Build an `AISession` from events |
| `TWAI_EXTENSION` / `TWAI_MIME` | `.twai` and `application/vnd.twilic.ai+twai` |

### Record and replay

| Export | Description |
| --- | --- |
| `createAIRecorder(options?)` | Append-only event recorder |
| `createAIPlayer(session)` | Async-iterable / timed replay |
| `inspectSession(session)` | Summary (event counts, models, text bytes, …) |
| `summarizeEvent(event)` | Short human-readable event line |
| `diffSessions(before, after)` | Structural diff of two sessions |
| `convertSession(session, { to })` | Convert to `"json"` or `"jsonl"` |
| `parseJsonlEvents(text)` | Parse JSONL event lines |

### Size comparison

| Export | Description |
| --- | --- |
| `compareSessionSizes(session)` | Compare JSON / gzip / Twilic / `.twai` sizes |
| `encodeSessionTwai(session)` | Encode session as `.twai` bytes |

## Canonical event types

```ts
"session.start" |
  "session.end" |
  "request.created" |
  "text.delta" |
  "reasoning.delta" |
  "tool.input.delta" |
  "tool.started" |
  "tool.output" |
  "retrieval.result" |
  "usage.updated" |
  "trace.span" |
  "checkpoint.updated" |
  "response.completed" |
  "custom";
```

## Related

- [Twilic AI overview](/ai/)
- [`.twai` format](/ai/format)
- [OpenAI adapter](/ai/openai)
- [CLI `ai` commands](/guide/cli#ai)
