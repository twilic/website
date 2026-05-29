# Specification Overview

This page gives a concise summary of the Twilic v2 specification. For normative detail, read the full spec in the [twilic repository](https://github.com/twilic/twilic).

## Purpose

Twilic v2 defines a binary format that keeps MessagePack-like usability while producing smaller representations under the following conditions:

- Objects with the same shape appear repeatedly.
- Messages under the same schema appear repeatedly.
- Repeated strings and similar strings are common.
- Homogeneous arrays and typed vectors are common.
- Multiple records with the same schema can be sent together.
- Optional-field distributions and integer series are biased.

## Design Principles

| Principle | Summary |
| --- | --- |
| Usable through the same API | Dynamic mode for ad-hoc values; compact mode for schema-aware usage. Both use the same public API. |
| Deferred optimization | First transmission may be self-describing. Compact forms activate as repetition accumulates. |
| Minimize one-shot cost | Small, non-repeating messages pay no control overhead. |
| Win decisively on repetition | Shape, key, string interning; typed vectors; columnar batches; stateful patches all compound. |
| Deterministic wire format | Same profile + same state → same bytes. Essential for testing and interoperability. |
| Optional stateful optimization | Stateless mode always works. Stateful mode requires an ordered, reliable session. |

## Profiles

Twilic defines four primary profiles. They compose: a session may use Dynamic for one-shot messages and Batch for bulk transfers.

| Profile | Description |
| --- | --- |
| **Dynamic** | MessagePack-like. Any root value, no schema required. Shape/key/string interning activates automatically. |
| **Bound** | Schema-aware. Field names and type tags are omitted; range-aware bit packing is used. |
| **Batch** | Multiple records with the same shape or schema. Row-wise or columnar with per-column codec selection. |
| **Stateful** | Compresses against previous messages over a stream. Base snapshots, state patches, template batches. Optional — requires ordered, reliable delivery. |

## v2 vs v1

v2 is a clean break from v1. A v2 decoder is **not** required to decode v1 payloads.

Key changes in v2:

- Compact **tag-table** wire model replaces v1 top-level message-kind envelope.
- Per-message key/string/shape interning tables (message-local, not session-scoped).
- Standardized `shape_def` / `shape_ref` for same-shape map arrays.
- `typed_vec` for homogeneous primitive arrays.
- `row_batch` / `col_batch` for explicit batching.
- `state_patch` / `template_batch` for stateful session optimization.

## Read Order

1. [Wire Tags](/spec/wire-tags) — first-byte families and extended tag meanings.
2. [Profiles](/spec/profiles) — Dynamic, Bound, Batch, Stateful in detail.
3. [Format Guide](/spec/format) — byte-level structure and decode shape.
4. [Encoding Guide](/spec/encoding) — scalar rules, vector codecs, string modes.
5. [Transport Guide](/spec/transport) — session-scoped state and transport assumptions.
6. [v2 Reference Profile](/spec/v2) — the normative interoperability profile.
