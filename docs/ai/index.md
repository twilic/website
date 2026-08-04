# Twilic AI

Record, replay, and inspect AI streams and agent runs as Twilic binary sessions.

**Record once. Replay anywhere. Send less.**

Twilic AI turns streaming LLM and agent traffic into compact, replayable `.twai` sessions. Use it to shrink traces for storage and transport, compare runs, and debug with the same CLI tooling as the rest of Twilic.

**Source:** [github.com/twilic/ai](https://github.com/twilic/ai)

## Packages

| Package | Role | Docs |
| --- | --- | --- |
| `@twilic/ai` | Core recorder, `.twai` codec, replay, inspect, diff | [Core](/ai/core) |
| `@twilic/ai-openai` | OpenAI Responses API event normalization | [OpenAI](/ai/openai) |
| `@twilic/ai-sdk` | Vercel AI SDK transport + recorder helpers | [AI SDK](/ai/ai-sdk) |
| `@twilic/ai-agents` | Agents SDK tracing processor | [Agents](/ai/agents) |

## Install

```bash
pnpm add @twilic/ai @twilic/core
```

Optional adapters:

```bash
pnpm add @twilic/ai-openai @twilic/ai-sdk @twilic/ai-agents
```

For CLI session tooling:

```bash
pnpm add -g @twilic/cli @twilic/core @twilic/ai
```

## Quick start

```ts
import { createAIRecorder, ensureTwilicInit, writeSession } from "@twilic/ai";

await ensureTwilicInit();

const recorder = createAIRecorder({
  sessionId: "demo-session",
  meta: { provider: "openai", model: "gpt-4.1" },
});

await recorder.record(async () => {
  recorder.append({
    type: "text.delta",
    sequence: recorder.events.length,
    timestamp: Date.now(),
    sessionId: "demo-session",
    data: { delta: "Hello from Twilic AI." },
  });
});

await writeSession("session.twai", {
  meta: {
    format: "twai",
    version: 1,
    sessionId: "demo-session",
    createdAt: Date.now(),
    eventCount: recorder.events.length,
  },
  events: recorder.events,
});
```

Inspect and replay with the CLI:

```bash
twilic ai inspect session.twai
twilic ai replay session.twai --speed 10
twilic ai record --input events.jsonl -o session.twai
```

## `.twai` sessions

`.twai` is the canonical container for Twilic AI sessions. It stores Twilic-encoded session metadata and a ordered list of canonical AI events.

| Field     | Description                      |
| --------- | -------------------------------- |
| MIME type | `application/vnd.twilic.ai+twai` |
| Extension | `.twai`                          |
| Magic     | ASCII `TWAI`                     |

Each event includes `type`, `sequence`, `timestamp`, `sessionId`, optional correlation IDs (`responseId`, `itemId`, `toolCallId`), and a `data` payload. Canonical types include `text.delta`, `reasoning.delta`, `tool.started`, `tool.output`, `response.completed`, and more.

See the [`.twai` format](/ai/format) page for the on-disk layout.

## When to use it

| Goal | Approach |
| --- | --- |
| Persist a chat or agent run | Record events → write `.twai` |
| Shrink traces vs JSON/JSONL | Encode with `@twilic/ai`; compare with `twilic ai benchmark` |
| Normalize provider streams | `@twilic/ai-openai` for OpenAI Responses |
| Capture Vercel AI SDK chats | `TwilicChatTransport` from `@twilic/ai-sdk` |
| Trace Agents SDK runs | `TwilicTracingProcessor` from `@twilic/ai-agents` |
| Diff two runs | `diffSessions` or `twilic ai diff` |

## Related

- [Twilic CLI — `ai` commands](/guide/cli#ai)
- [JavaScript Core API](/reference/javascript-core)
- [Examples in the AI repo](https://github.com/twilic/ai/tree/main/examples)
