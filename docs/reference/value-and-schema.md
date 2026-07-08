# Value & Schema Types

Twilic SDKs share a common value model derived from JSON semantics, extended with native binary types and schema-aware Bound profile encoding.

## TwilicValue

The dynamic value type accepted by `encode()` and returned by `decode()`.

### JavaScript / TypeScript

```ts
type TwilicValue =
  | null
  | boolean
  | number
  | bigint
  | string
  | Uint8Array
  | TwilicValue[]
  | { [key: string]: TwilicValue };
```

| Type | Wire representation | Notes |
| --- | --- | --- |
| `null` | Nil | — |
| `boolean` | Bool | — |
| `number` | f64 or i64/u64 if integer | Prefer `bigint` for u64/i64 |
| `bigint` | u64 or i64 | Safe for values > 2^53 |
| `string` | str | UTF-8 |
| `Uint8Array` | bin | Native binary — no base64 |
| `TwilicValue[]` | array | Homogeneous arrays may use typed vector codecs |
| `{ [key: string]: TwilicValue }` | map | String keys recommended |

### Rust

```rust
pub enum Value {
    Null,
    Bool(bool),
    I64(i64),
    U64(u64),
    F64(f64),
    String(String),
    Binary(Vec<u8>),
    Array(Vec<Value>),
    Map(Vec<(String, Value)>),
}
```

### Python

```python
# null, bool, int, float, str, bytes, list, dict
twilic.new_map(twilic.entry("key", twilic.new_u64(42)))
```

### Go

```go
twilic.NewMap(
    twilic.Entry("id", twilic.NewU64(42)),
    twilic.Entry("name", twilic.NewString("alice")),
)
```

## Schema (Bound profile)

When using `encodeWithSchema()`, provide a schema describing field positions and types.

### TypeScript

```ts
interface Schema {
  schemaId: number | bigint;
  name: string;
  fields: SchemaField[];
}

interface SchemaField {
  number: number | bigint;
  name: string;
  logicalType: string;
  required: boolean;
  defaultValue?: TwilicValue;
  min?: number | bigint;
  max?: number | bigint;
  enumValues?: string[];
}
```

### Example

```ts
import { encodeWithSchema } from "@twilic/core/advanced";

const schema: Schema = {
  schemaId: 1,
  name: "Transaction",
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
  ],
};

const tx = {
  transaction_id: 8872341n,
  amount_cents: 4999n,
  currency: "USD",
  status: "pending",
};

const bytes = encodeWithSchema(schema, tx);
```

Enum fields with `enumValues` encode as bit indices — 4 allowed values need 2 bits on the wire.

### Rust

```rust
use twilic::{Schema, Value, encode_with_schema};

let schema = Schema { /* ... */ };
let value = Value::Map(vec![ /* ... */ ]);
let bytes = encode_with_schema(&schema, &value)?;
```

## Map key conventions

| Key style | Best for |
| --- | --- |
| String keys | Cross-language interop, versioning, JSON compatibility |
| Integer keys (array maps) | Closed hot paths with code generation |

Always use string keys for public or long-lived internal contracts.

## Logical types

Common `logicalType` values for Bound profile fields:

| logicalType  | Description                      |
| ------------ | -------------------------------- |
| `bool`       | Boolean                          |
| `i64`, `u64` | Signed / unsigned 64-bit integer |
| `f64`        | IEEE 754 double                  |
| `string`     | UTF-8 string                     |
| `binary`     | Raw bytes                        |

Range constraints (`min`, `max`) enable range-aware bitpacking. `enumValues` enable index encoding.

## Related

- [Schema-Bound Encoding](/guide/schema-bound)
- [Encoding Profiles](/guide/encoding-profiles)
- [Specification — Profiles](/spec/profiles)
