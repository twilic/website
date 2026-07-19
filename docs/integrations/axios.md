# @twilic/axios

Axios interceptors for Twilic request encoding and response decoding.

**Package:** `@twilic/axios`  
**Peer dependencies:** `axios`, `@twilic/core`  
**Source:** [github.com/twilic/axios](https://github.com/twilic/axios)

## Install

```bash
pnpm add @twilic/axios axios @twilic/core
```

## Quick start

```ts
import axios from "axios";
import { init } from "@twilic/core";
import { createTwilicAxios } from "@twilic/axios";

await init();

const client = createTwilicAxios(axios.create({ baseURL: "/api" }));

const { data } = await client.post("/users", null, {
  twilicBody: { id: 1n, name: "alice" },
});
// data is decoded TwilicValue
```

## Exports

### Constants

```ts
export const TWILIC_CONTENT_TYPE = "application/vnd.twilic";
```

### Functions

#### `createTwilicAxios(instance, codec?)`

Wraps an Axios instance with Twilic interceptors.

```ts
function createTwilicAxios(
  instance: AxiosInstance,
  codec?: TwilicCodec,
): AxiosInstance;
```

#### `twilicRequestInterceptor(codec)`

Standalone request interceptor.

```ts
function twilicRequestInterceptor(
  codec: TwilicCodec,
): (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
```

#### `twilicResponseInterceptor(codec)`

Standalone response interceptor.

```ts
function twilicResponseInterceptor(
  codec: TwilicCodec,
): (response: AxiosResponse) => AxiosResponse;
```

### Request config extension

```ts
interface TwilicAxiosRequestConfig {
  twilicBody?: TwilicValue;
  twilicResponse?: boolean; // default: true when twilicBody is set
}
```

When `twilicBody` is set:

1. Request interceptor encodes body to binary
2. Sets `Content-Type: application/vnd.twilic`
3. Sets `responseType: "arraybuffer"` (unless `twilicResponse: false`)

Response interceptor decodes Twilic responses automatically.

## JSON fallback route

```ts
// Expect JSON response from this endpoint
const { data } = await client.get("/health", {
  twilicResponse: false,
});
```

## Manual interceptor setup

```ts
import axios from "axios";
import { encode, decode } from "@twilic/core";

const codec = { encode, decode };
const client = axios.create();
client.interceptors.request.use(twilicRequestInterceptor(codec));
client.interceptors.response.use(twilicResponseInterceptor(codec));
```

## Related

- [Fetch client](/integrations/fetch)
- [Internal APIs article](/guide/articles/internal-apis-without-protobuf-overhead)
- [Examples — HTTP Round-Trip](/guide/examples#http-round-trip)
