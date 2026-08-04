# @twilic/ai-openai

Normalize OpenAI Responses API events into Twilic AI canonical events and sessions.

**Package:** `@twilic/ai-openai`  
**Peer dependency:** `@twilic/core`  
**Depends on:** `@twilic/ai`  
**Source:** [github.com/twilic/ai](https://github.com/twilic/ai)

## Install

```bash
pnpm add @twilic/ai-openai @twilic/ai @twilic/core
```

## Quick start

```ts
import {
  ensureTwilicInit,
  inspectSession,
  sessionFromEvents,
  writeSession,
} from "@twilic/ai";
import { recordOpenAIResponses } from "@twilic/ai-openai";

await ensureTwilicInit();

const rawEvents = [
  { type: "response.created", response: { id: "resp_1", model: "gpt-4.1" } },
  { type: "response.output_text.delta", delta: "Hello" },
  { type: "response.completed", response: { id: "resp_1" } },
];

const events = await recordOpenAIResponses(rawEvents, {
  sessionId: "openai-demo",
  model: "gpt-4.1",
});

const session = sessionFromEvents(events, {
  sessionId: "openai-demo",
  provider: "openai",
  model: "gpt-4.1",
});

await writeSession("openai-session.twai", session);
console.log(inspectSession(session));
```

## Exports

### `normalizeOpenAIResponseEvent(raw, context)`

Map a single OpenAI Responses event to a canonical `AIEvent`.

```ts
function normalizeOpenAIResponseEvent(
  raw: OpenAIRawEvent,
  context: NormalizeContext,
): AIEvent;
```

### `normalizeOpenAIResponseStream(rawEvents, context)`

Normalize an array of raw events with increasing `sequence` values.

### `recordOpenAIResponses(rawEvents, options)`

Normalize a stream and return canonical events ready for `sessionFromEvents`.

```ts
interface RecordOpenAIResponsesOptions {
  sessionId: string;
  provider?: string;
  model?: string;
}
```

## Type mapping

| OpenAI Responses type                    | Canonical type       |
| ---------------------------------------- | -------------------- |
| `response.created`                       | `request.created`    |
| `response.output_text.delta`             | `text.delta`         |
| `response.reasoning_summary_text.delta`  | `reasoning.delta`    |
| `response.function_call_arguments.delta` | `tool.input.delta`   |
| `response.output_item.added`             | `tool.started`       |
| `response.function_call_arguments.done`  | `tool.output`        |
| `response.file_search_call.completed`    | `retrieval.result`   |
| `response.completed` / `response.done`   | `response.completed` |
| (other)                                  | `custom`             |

Provider-specific details are preserved under `event.extensions.openai`.

## Related

- [Twilic AI overview](/ai/)
- [`@twilic/ai`](/ai/core)
- [Example — openai-normalize](https://github.com/twilic/ai/tree/main/examples/openai-normalize)
