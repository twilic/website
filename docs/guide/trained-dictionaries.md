# Trained Dictionaries

Trained dictionaries compress small, highly correlated message families by referencing a shared string table (`dict_id`) instead of sending literals on every message. They are an optional stateful feature — enabled by default in session encoders but invisible when payloads do not match the candidate profile.

## When dictionaries help

| Signal            | Threshold (spec Rule ST4)           |
| ----------------- | ----------------------------------- |
| Payload family    | Stable schema/shape across messages |
| Encoded size      | 128 B – 8 KB per message            |
| String repetition | Same vocabulary across the family   |

Typical workloads:

- Paginated API responses with repeated enum/status strings
- Log events sharing `level`, `service`, `region` values
- Telemetry ticks with stable field names and low-cardinality dimensions
- Small control messages in a long-lived session

Dictionaries do **not** help one-shot large batches (use [Batch profile](/guide/batch-and-columnar)) or unrelated cache keys (use stateless [Dynamic](/guide/encoding-profiles)).

## Wire format

A trained dictionary reference encodes as:

```text
[dict_id][compressed block]
```

The compressed block maps column string values to dictionary indices. Dictionary metadata (id, version, hash, invalidation rule) travels in the control stream so a fresh decoder can load the profile before decoding references.

See [Spec §13.5.7](https://github.com/twilic/twilic/blob/main/versions/v2.md) and [§15.4 trained dictionary transport](https://github.com/twilic/twilic/blob/main/versions/v2.md).

## Session configuration

Dictionaries are controlled by `enableTrainedDictionary` on the session encoder:

```ts
import { createSessionEncoder } from "@twilic/core";

const enc = createSessionEncoder({
  enableTrainedDictionary: true, // default
});
```

```rust
use twilic::{create_session_encoder, SessionOptions};

let enc = create_session_encoder(SessionOptions {
    enable_trained_dictionary: true,
    ..Default::default()
});
```

```python
import twilic

enc = twilic.create_session_encoder(
    twilic.SessionOptions(enable_trained_dictionary=True)
)
```

Disable when debugging wire bytes or when message families are too heterogeneous:

```ts
createSessionEncoder({ enableTrainedDictionary: false });
```

## How dictionaries are learned

Within a session, the encoder:

1. Observes string columns in batch or repeated single messages
2. Builds a dictionary when unique ratio is low (spec simplified heuristic: `unique_ratio <= 0.25`)
3. Assigns a `dict_id` and transports the dictionary profile to the decoder
4. Subsequent messages reference `dict_id` + compressed block

Fresh decoders receive the dictionary profile through the control stream before any `dict_id` reference is decoded. Invalid hash or version mismatch is rejected — see conformance tests in twilic-rust.

## Dictionary scope

Separate dictionaries per data family (spec §15.3):

```text
user-records-dict     → paginated user API
log-events-dict       → structured logging
telemetry-tick-dict   → live metrics stream
```

Do not share one dictionary across unrelated message types. Encoder auto-selection assigns dictionary IDs per family within a session.

## Invalidation and recovery

Dictionary state is session-local. After disconnect or `RESET_STATE`:

- All `dict_id` references become invalid
- Sender must re-transport dictionary profiles or fall back to stateless encoding
- Receiver discards cached dictionaries

```ts
enc.reset(); // clears dictionary state along with bases and templates
```

If a decoder receives an unknown `dict_id`:

| Policy           | Behavior                |
| ---------------- | ----------------------- |
| `failFast`       | Decode error            |
| `statelessRetry` | Signal full-frame retry |

See [Stateful Decoding](/guide/stateful-decoding) and [Session Encoder](/reference/session-encoder).

## vs column DICTIONARY codec

Twilic has two dictionary mechanisms:

| Mechanism | Scope | When |
| --- | --- | --- |
| Column `DICTIONARY` codec | Single batch message | Low-cardinality string column in `col_batch` |
| Trained dictionary | Session-wide | Repeated small messages in same family |

Column dictionary is stateless within the batch. Trained dictionary persists across the session for incremental streams.

## Measuring impact

1. Run [Playground](/guide/playground) schema-first view on your record shape
2. Compare stateless `encode()` vs session `encodeMicroBatch()` on log fixtures
3. Use `pnpm example:logs` in [examples](https://github.com/twilic/examples) for batch vs micro-batch size tables

For patch + dictionary combined savings, run `pnpm example:websocket:simulate`.

## Related

- [Encoder Selection](/guide/encoder-selection) — Rule ST4 thresholds
- [Stateful Streams](/guide/stateful-streams)
- [Batch & Columnar](/guide/batch-and-columnar)
- [Session Encoder reference](/reference/session-encoder)
