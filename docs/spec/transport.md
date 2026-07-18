# Transport Guide

This guide describes transport and session behavior for Twilic v3.

## Stateless vs Stateful

- Stateless mode: every message is self-sufficient or uses externally supplied schema/framing.
- Stateful mode: messages may reference prior session state, but only under a negotiated stateful profile.

The v3 reference interoperability profile is stateless unless such a profile is explicitly negotiated.

## Session State

Negotiated state may include:

- base snapshots
- templates
- optional dictionary metadata
- persistent key/string/shape table extensions

Per-message key/string/shape interning tables are message-local in Dynamic Profile unless a persistent table extension is negotiated.

Session state objects such as `base_id`, `template_id`, and dictionary ids must not be reused across independent streams.

## Stateful Forms

Stateful wire forms require a negotiated transport/profile that defines state-reference discriminators, reset control encoding, dictionary ids, and retention rules.

Dynamic and envelope tags differ:

| Dynamic tag | Envelope kind | Meaning |
| --- | --- | --- |
| `state_patch` `0xDD` | `STATE_PATCH` `0x0A` | patch against previous/base state |
| `template_batch` `0xDE` | `TEMPLATE_BATCH` `0x0B` | template-based micro-batch |
| — | `CONTROL_STREAM` `0x0C` | packed control lane |
| — | `BASE_SNAPSHOT` `0x0D` | snapshot used by patches |

## Bound and Batch Forms

`BOUND_STREAM` and `SCHEMA_BATCH` are usable in stateless contexts when schema identity and framing are supplied in-band or by the enclosing transport.

- `BOUND_STREAM (0x0F)` is suitable when one shared schema is bound once and consecutive records omit per-record schema/object envelopes.
- `SCHEMA_BATCH (0x0E)` is suitable when the same shared schema repeats and columnar gains are available.

## Reset Behavior

`RESET_STATE` invalidates all state references, including bases, templates, dictionaries, and negotiated persistent key/string/shape tables. It must be encoded by a negotiated control operation before it can affect decode state.

## Versioning

- v3 is a clean break from v2 for Bound Profile field/record-body payloads.
- Dynamic Profile may retain v2-compatible tags where unchanged.
- Dual support requires explicit profile and version signaling outside payload decode heuristics.
