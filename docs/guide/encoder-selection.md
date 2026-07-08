# Encoder Selection

Twilic encoders automatically choose wire representation based on value statistics and session context. Selection rules are **deterministic** — the same input and profile configuration always produces the same bytes across SDKs and languages.

This guide summarizes the heuristics from [Spec §18](https://github.com/twilic/twilic/blob/main/versions/v2.md). You rarely need to configure them manually; understanding them helps debug size regressions and choose the right profile.

## Selection pipeline

```text
1. Classify root value (scalar / map / array / schema / batch / patch)
2. Detect repetition → intern keys, strings, shapes
3. Detect homogeneity → typed vectors, column batch
4. Compare patch vs full message (stateful only)
5. Select per-column codec from statistics
6. Apply generic compression last (optional block level)
```

## Profile selection (start here)

Before wire-level heuristics, pick the encoding profile:

| Question | Profile |
| --- | --- |
| Single HTTP body, no prior agreement? | [Dynamic](/guide/encoding-profiles#dynamic-profile) |
| List of same-shape records? | [Batch](/guide/encoding-profiles#batch-profile) |
| Fixed schema, max density? | [Bound](/guide/encoding-profiles#bound-profile) |
| Ordered stream, few fields change? | [Stateful](/guide/encoding-profiles#stateful-profile) |

See the [encoding profiles decision flowchart](/guide/encoding-profiles#decision-flowchart).

## Dynamic object rules

### Rule D1: Schema object

`encodeWithSchema(schema, value)` always emits `SCHEMA_OBJECT`. Bound profile — field names omitted.

### Rule D2: Shape registration

When the same key sequence appears **≥ 2 times** in a message (or stream):

- `field_count >= 3` → register shape, use `SHAPED_OBJECT`
- Sends `shape_def` once, then `shape_ref` on subsequent objects

One-shot objects with unique key order stay as plain `MAP`.

### Rule D3: Keep MAP

Stay in plain map mode when:

- `field_count <= 1`
- Key sequence is not reused
- Registration cost exceeds reuse benefit

## Key and string interning

### Rule K1: Key interning

Register key literal when observed **≥ 2 times** (recommended: key length ≥ 3 bytes).

### String modes (Rule S1–S4)

| Mode         | When                        |
| ------------ | --------------------------- |
| LITERAL      | First occurrence            |
| REF          | Repeated exact string       |
| PREFIX_DELTA | Strings share common prefix |
| EMPTY        | Zero-length string          |

String tables reset at each top-level message boundary in stateless mode.

## Array and typed vector

### Rule A1: Typed vector threshold

Homogeneous primitive array with **count ≥ 4** → `typed_vec` with appropriate numeric codec.

Mixed-type or small arrays stay as plain `ARRAY`.

## Batch selection

### Row vs column

| Condition                      | Choice                           |
| ------------------------------ | -------------------------------- |
| Small batch, nested objects    | `row_batch`                      |
| 16+ rows, same schema, tabular | `col_batch`                      |
| Mixed shapes in micro-batch    | Fall back to per-message Dynamic |

### Column codec guidance (§13.4)

| Column statistics                                | Codec                 |
| ------------------------------------------------ | --------------------- |
| Monotonic integers                               | DELTA / DELTA_FOR     |
| Clustered integers                               | FOR                   |
| Low-cardinality strings (`unique_ratio <= 0.25`) | DICTIONARY            |
| Repeated values (`repeated_ratio >= 0.5`)        | RLE                   |
| Smooth float series                              | XOR_FLOAT             |
| Regular integer sequence                         | DELTA_DELTA_BITPACK   |
| Mostly null / mostly present                     | Bitmap with inversion |

## Stateful selection

### Rule ST1: Previous-message patch

Use `STATE_PATCH(previous)` when:

- Same schema/shape
- `changed_field_ratio <= 0.25` (strongly recommended: `<= 0.10`)
- Patch bytes significantly smaller than full message

### Rule ST2: Base snapshot patch

When patch against a recent base snapshot is **< 70%** of full message size, use `STATE_PATCH(base_id)`.

### Rule ST3: Template batch

When **≥ 4** small same-shape messages arrive before a full column batch is ready → `TEMPLATE_BATCH`.

### Rule ST4: Trained dictionary

Stable payload family, encoded size **128 B – 8 KB** → trained dictionary candidate.

See [Trained Dictionaries](/guide/trained-dictionaries).

### Rule ST5: Stateless fallback

Prefer full stateless message when:

- Transport may reorder or drop messages
- Base synchronization is weak
- `changed_field_ratio` is high
- Decoder capability unknown

## Scoring method

Implementations may score candidate codecs:

```text
score(codec) = estimated_encoded_size(codec) + switching_penalty(codec)
```

`switching_penalty` adds hysteresis for profile stability. Reference implementation in twilic-rust uses deterministic tie-breaking — no random selection.

## Simplified cheat sheet

For minimal implementations (Spec §18.12):

| Heuristic                  | Threshold                               |
| -------------------------- | --------------------------------------- |
| Shape registration         | Same key sequence × 2                   |
| Typed vector               | Homogeneous primitives, count ≥ 4       |
| Column batch               | 16+ same-schema rows                    |
| String dictionary (column) | `unique_ratio <= 0.25`                  |
| Delta-FOR                  | Monotonic integer columns               |
| Delta-delta                | Regular integer sequences               |
| XOR float                  | Smooth float columns                    |
| RLE                        | `repeated_ratio >= 0.5`                 |
| Previous-message patch     | `changed_field_ratio <= 0.10`           |
| Trained dictionary         | 128 B – 8 KB, stable family             |
| Zero packing               | Fixed payload, `zero_byte_ratio >= 0.5` |
| Generic compression        | Encoded block ≥ 256 B                   |

## Debugging size regressions

1. Compare fixture sizes in [Benchmark Fixtures](/benchmark/fixtures)
2. Check if shape registration triggered (second identical object should be smaller)
3. Verify batch threshold — 15 records may stay row-wise, 256 triggers columnar
4. For streams, confirm patch ratio — high change ratio forces full frames
5. Run `twilic decode --verbose` (CLI) to inspect tag breakdown

## Determinism requirements

All v2 implementations MUST:

- Assign key/string/shape IDs in first-seen order (no randomization)
- Select codecs deterministically for equal input statistics
- Reset intern tables at each top-level message boundary

See [v2 Reference Profile — Default Deterministic Heuristics](/spec/v2#default-deterministic-heuristics).

## Related

- [Encoding Profiles](/guide/encoding-profiles)
- [Performance](/guide/performance)
- [Benchmark Fixtures](/benchmark/fixtures)
- [Spec §18 Encoder Auto-Selection](https://github.com/twilic/twilic/blob/main/versions/v2.md)
