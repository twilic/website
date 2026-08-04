# @twilic/ai-sdk

Vercel AI SDK chat transport and recorder helpers that capture runs as Twilic AI sessions.

**Package:** `@twilic/ai-sdk`  
**Peer dependencies:** `@twilic/core`, `ai`  
**Depends on:** `@twilic/ai`  
**Source:** [github.com/twilic/ai](https://github.com/twilic/ai)

## Install

```bash
pnpm add @twilic/ai-sdk @twilic/ai @twilic/core ai
```

## Quick start

```ts
import {
  ensureTwilicInit,
  inspectSession,
  sessionFromEvents,
} from "@twilic/ai";
import { TwilicChatTransport } from "@twilic/ai-sdk";

await ensureTwilicInit();

const transport = new TwilicChatTransport({
  api: "/api/chat",
  record: true,
});

const result = await transport.sendMessages({
  id: "chat-1",
  messages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "hi" }] }],
});

// Consume the UI message stream as usual…
await result.stream.cancel();

const events = transport.recorder?.events ?? [];
const session = sessionFromEvents(events, {
  sessionId: "chat-1",
  source: "ai-sdk",
});
console.log(inspectSession(session));
```

## Exports

### `TwilicChatTransport`

Drop-in chat transport compatible with the Vercel AI SDK `ChatTransport` surface.

```ts
interface TwilicChatTransportOptions {
  api?: string;
  fetch?: typeof fetch;
  recorder?: AIRecorder;
  record?: boolean;
  headers?: Record<string, string>;
}
```

Behavior:

- POSTs chat messages to `api` (default `/api/chat`)
- Accepts SSE (`text/event-stream`) or `.twai` (`application/vnd.twilic.ai+twai`) responses
- When `record: true` (or a custom `recorder` is passed), appends parsed events to an `AIRecorder`

### `createAISDKRecorder(options?)`

Convenience wrapper around `createAIRecorder` with AI SDK defaults.

## Related

- [Twilic AI overview](/ai/)
- [`@twilic/ai`](/ai/core)
- [Example — ai-sdk-transport](https://github.com/twilic/ai/tree/main/examples/ai-sdk-transport)
