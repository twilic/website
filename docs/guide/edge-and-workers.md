# Edge & Cloudflare Workers

Deploy Twilic on Cloudflare Workers, Vite edge apps, and other WASM-only runtimes. This guide covers WASM initialization, bundling, and Hono integration — the most common production stack for Twilic at the edge.

## Stack overview

```text
Browser / Worker
  └── @twilic/hono or @twilic/fetch
        └── @twilic/core
              └── twilic-wasm (WebAssembly)
```

Node.js N-API is not available on Workers. Always use the WASM backend.

## Minimal Worker setup

```ts
import { Hono } from "hono";
import { init } from "@twilic/core";
import { twilicParser, twilicResponse } from "@twilic/hono";
import wasmModule from "@twilic/core/wasm/twilic_wasm_bg.wasm";

// Initialize once at module scope (cold start)
await init({ prefer: "wasm", wasmInput: wasmModule });

const app = new Hono();

app.post("/metrics", twilicParser(), async (c) => {
  return twilicResponse(c, { ok: true, received: c.var.twilicBody });
});

export default app;
```

## WASM bundling with Vite / Wrangler

The [playground](https://github.com/twilic/playground) and [twilic-js](https://github.com/twilic/twilic-js) repos show the production-tested pattern:

### 1. Sync WASM artifacts

```bash
# Copies twilic-js/wasm/pkg → your project's wasm/pkg
pnpm sync-wasm
```

Run before `dev` and `build`. The playground uses `scripts/sync-twilic-wasm.mjs`.

### 2. Vite config

```ts
// vite.config.ts
export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true, // keep vendor chunks separate
      },
    },
  },
});
```

`assetsInclude` for `*.wasm` is required so Rolldown bundles wasm-pack output correctly.

### 3. Import WASM with `?url`

```ts
import wasmUrl from "@twilic/core/wasm/twilic_wasm_bg.wasm?url";

await init({
  prefer: "wasm",
  wasmInput: wasmUrl,
});
```

Do **not** use bare `?init` imports with Rolldown — they omit wasm-bindgen JS imports and break initialization.

### 4. Manual instantiate (advanced)

The playground uses manual `instantiateStreaming` with explicit glue imports when bundler auto-init fails:

```ts
import wasmUrl from "./twilic_wasm_bg.wasm?url";
import * as glue from "./twilic_wasm_bg.js";

const response = fetch(wasmUrl);
const { instance } = await WebAssembly.instantiateStreaming(response, {
  "./twilic_wasm_bg.js": glue,
});
// pass instance to init via wasmInput
```

See `playground/src/shims/` for browser-safe backend substitutions that exclude Node N-API loaders.

## Cloudflare Workers + Hono

```bash
pnpm add hono @twilic/hono @twilic/core
pnpm add -D wrangler
```

`wrangler.toml`:

```toml
name = "twilic-api"
compatibility_date = "2024-01-01"

[assets]
directory = "./dist"
```

Build with Vite (WASM bundled into `dist/assets/`), deploy with Wrangler. Use stateless Dynamic or Batch profiles only — not Stateful on HTTP.

### Content negotiation at the edge

```ts
app.get("/users", async (c) => {
  const users = await fetchUsers();

  if (c.req.header("accept")?.includes("application/vnd.twilic")) {
    return twilicResponse(c, users);
  }
  return c.json(users);
});
```

See [Examples — API response](https://github.com/twilic/examples).

## Client-side fetch from Workers

For Worker-to-origin calls with Twilic:

```ts
import { init } from "@twilic/core";
import { twilicFetchJson } from "@twilic/fetch";
import wasmUrl from "@twilic/core/wasm/twilic_wasm_bg.wasm?url";

await init({ prefer: "wasm", wasmInput: wasmUrl });

const data = await twilicFetchJson("https://api.example.com/users", {
  headers: { Accept: "application/vnd.twilic" },
});
```

## Cold start considerations

| Factor                   | Impact                                            |
| ------------------------ | ------------------------------------------------- |
| WASM module size         | Adds to cold start; amortize across many requests |
| `init()` at module scope | Runs once per isolate — preferred                 |
| `init()` per request     | Avoid — re-initializes WASM every time            |
| Batch encoding           | Amortizes encoder overhead across records         |

Measure bundle size with `@twilic/core` CI tooling (`twilic-js/scripts/measure-bundle.mjs`).

## GitHub Pages / static hosting

The playground deploys to GitHub Pages with `GITHUB_PAGES=true` at build time for correct asset base paths. Same pattern applies to any static Twilic SPA:

```bash
GITHUB_PAGES=true pnpm build
```

## Common pitfalls

| Problem | Fix |
| --- | --- |
| `backend not initialized` | Call `await init()` before first encode/decode |
| WASM MIME error in preview | Bundle WASM via Vite `assetsInclude`, not `/public` |
| `?init` import fails | Use `?url` + manual instantiate or `wasmInput` URL |
| N-API import in browser bundle | Use `src/shims/` pattern from playground |
| Stateful on HTTP routes | Use stateless profiles only at edge |

## Local development

```bash
# Terminal 1 — build twilic-js WASM first
cd twilic-js && pnpm build:wasm && pnpm build:ts

# Terminal 2 — your edge app
cd your-app && pnpm dev
```

## Related

- [Hono integration](/integrations/hono)
- [Fetch client](/integrations/fetch)
- [JavaScript Core — init()](/reference/javascript-core#initialization)
- [Playground](/guide/playground)
