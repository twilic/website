# Schema-Bound Encoding

The Bound profile encodes values using a predefined schema. Field names disappear from the wire; enum and range constraints shrink individual fields to bit-level representations.

Use Bound when message shape is stable, latency matters, and you want Protobuf-class density without `.proto` codegen — or as the final optimization tier after starting with Dynamic.

## When to use Bound

| Signal                              | Bound fit                         |
| ----------------------------------- | --------------------------------- |
| Message struct unchanged for months | Strong                            |
| Enum fields with ≤ 256 values       | Strong                            |
| Numeric fields with known min/max   | Strong                            |
| Ad-hoc maps with arbitrary keys     | Poor — use Dynamic                |
| Rapid schema iteration              | Start with Dynamic, migrate later |

## Defining a schema

### TypeScript

```ts
import type { Schema } from "@twilic/core";

const paymentSchema: Schema = {
  schemaId: 1,
  name: "Payment",
  fields: [
    { number: 0, name: "transaction_id", logicalType: "u64", required: true },
    {
      number: 1,
      name: "amount_cents",
      logicalType: "u64",
      required: true,
      min: 0n,
      max: 100_000_00n,
    },
    {
      number: 2,
      name: "currency",
      logicalType: "string",
      required: true,
      enumValues: ["USD", "EUR", "GBP", "JPY"],
    },
    {
      number: 3,
      name: "status",
      logicalType: "string",
      required: true,
      enumValues: ["pending", "settled", "failed"],
    },
    { number: 4, name: "timestamp_ms", logicalType: "u64", required: true },
    { number: 5, name: "merchant_id", logicalType: "u64", required: true },
    { number: 6, name: "note", logicalType: "string", required: false },
  ],
};
```

### Field numbering

- Use stable field numbers — they are part of the wire contract
- Never reuse numbers after deployment
- Add new fields with new numbers (additive only)

## Encoding

```ts
import { encodeWithSchema } from "@twilic/core/advanced";

const tx = {
  transaction_id: 8872341n,
  amount_cents: 4999n,
  currency: "USD",
  status: "pending",
  timestamp_ms: 1700000000000n,
  merchant_id: 512n,
  note: null,
};

const bytes = encodeWithSchema(paymentSchema, tx);
```

## Size comparison (single 6-field record)

| Format                 | Approx. size |
| ---------------------- | ------------ |
| JSON                   | ~120 bytes   |
| MessagePack            | ~80 bytes    |
| Twilic Dynamic         | ~75 bytes    |
| Protobuf (with .proto) | ~45 bytes    |
| Twilic Bound           | ~40–50 bytes |

For **batches**, Twilic columnar mode often beats Protobuf because per-column codecs compress patterns Protobuf treats as independent values.

## Enum encoding

Fields with `enumValues` encode as indices:

| Allowed values | Bits on wire  |
| -------------- | ------------- |
| 2              | 1             |
| 3–4            | 2             |
| 5–8            | 3             |
| …              | ceil(log2(n)) |

```ts
enumValues: ["USD", "EUR", "GBP", "JPY"]; // 4 values → 2 bits
enumValues: ["pending", "settled", "failed"]; // 3 values → 2 bits
```

## Range-aware integers

When `min` and `max` are set, the encoder uses the minimum bit width that covers the range:

```ts
{ number: 1, name: "amount_cents", logicalType: "u64", min: 0n, max: 100_000_00n }
```

## Schema evolution

Bound profile requires discipline:

1. **Add** fields with new numbers — old decoders ignore unknown fields if your SDK supports it
2. **Never remove** or renumber deployed fields
3. **Version** schemas via `schemaId` when making breaking changes
4. Document compatibility in an internal RFC

For cross-team contracts with strict governance, Protobuf + gRPC may still be simpler.

## Playground validation

Use the [Playground](/guide/playground) schema-first view to compare Twilic Bound against Protobuf, Avro, and FlatBuffers on your schema.

Fixture: [schema-example.json](https://github.com/twilic/twilic/blob/main/examples/schema-example.json)

## Migration from Dynamic

```text
Phase 1: Dynamic on all messages (no schema)
Phase 2: Define schema from observed production shapes
Phase 3: encodeWithSchema on hot path only
Phase 4: Expand to additional message types
```

## Related

- [Value & Schema reference](/reference/value-and-schema)
- [Encoding Profiles](/guide/encoding-profiles)
- [Comparison — Protobuf](/guide/comparison#twilic-vs-protocol-buffers)
