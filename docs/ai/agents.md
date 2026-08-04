# @twilic/ai-agents

Map OpenAI Agents SDK traces and spans onto Twilic AI events.

**Package:** `@twilic/ai-agents`  
**Peer dependency:** `@twilic/core`  
**Depends on:** `@twilic/ai`  
**Source:** [github.com/twilic/ai](https://github.com/twilic/ai)

## Install

```bash
pnpm add @twilic/ai-agents @twilic/ai @twilic/core
```

## Quick start

```ts
import {
  ensureTwilicInit,
  inspectSession,
  sessionFromEvents,
  writeSession,
} from "@twilic/ai";
import { createAgentsRecorder } from "@twilic/ai-agents";

await ensureTwilicInit();

const sessionId = "agents-demo";
const recorder = createAgentsRecorder({
  sessionId,
  meta: { provider: "openai-agents", model: "gpt-4.1" },
});

const { processor } = recorder;

processor.onTraceStart({
  traceId: "trace_1",
  name: "research-agent",
});

processor.onSpanStart({
  spanId: "span_1",
  traceId: "trace_1",
  name: "llm.generate",
  input: { prompt: "Summarize Twilic AI." },
});

processor.onSpanEnd({
  spanId: "span_1",
  traceId: "trace_1",
  name: "llm.generate",
  output: { text: "Compact replayable agent runs." },
});

processor.onTraceEnd({ traceId: "trace_1", name: "research-agent" });

const session = sessionFromEvents(recorder.events, {
  sessionId,
  provider: "openai-agents",
});
await writeSession("agents-session.twai", session);
console.log(inspectSession(session));
```

## Exports

### `TwilicTracingProcessor`

Implements the Agents SDK tracing processor callbacks (`onTraceStart`, `onTraceEnd`, `onSpanStart`, `onSpanEnd`) and emits canonical `AIEvent`s.

```ts
interface TwilicTracingProcessorOptions {
  sessionId: string;
  provider?: string;
  model?: string;
  onEvent?: (event: AIEvent) => void;
}
```

Typical mapping:

| Callback                    | Event type      |
| --------------------------- | --------------- |
| `onTraceStart`              | `session.start` |
| `onTraceEnd`                | `session.end`   |
| `onSpanStart` / `onSpanEnd` | `trace.span`    |

### `createAgentsRecorder(options)`

Creates an `AIRecorder` plus a wired `TwilicTracingProcessor` for one-shot capture.

## Related

- [Twilic AI overview](/ai/)
- [`@twilic/ai`](/ai/core)
- [Example — agents-trace](https://github.com/twilic/ai/tree/main/examples/agents-trace)
