# Java API Reference

The Java SDK (`io.twilic:twilic`) provides Dynamic, Bound, Batch, and Stateful encoding via JNI bindings to the Rust core.

## Installation

```xml
<dependency>
  <groupId>io.twilic</groupId>
  <artifactId>twilic</artifactId>
  <version>0.1.0</version>
</dependency>
```

Requires Java 17+ and a platform-native library bundled with the JAR.

## Quick start

```java
import io.twilic.Twilic;
import io.twilic.internal.core.MapEntry;
import io.twilic.internal.core.Value;

Value value = Twilic.newMap(
    Twilic.entry("id", Twilic.newU64(1001)),
    Twilic.entry("name", Twilic.newString("alice"))
);

byte[] encoded = Twilic.encode(value);
Value decoded = Twilic.decode(encoded);
```

## Core functions

| Function                                 | Description                     |
| ---------------------------------------- | ------------------------------- |
| `Twilic.encode(Value)`                   | Dynamic profile encode          |
| `Twilic.decode(byte[])`                  | Dynamic profile decode          |
| `Twilic.encodeWithSchema(Schema, Value)` | Bound profile encode            |
| `Twilic.encodeBatch(List<Value>)`        | Row batch encode                |
| `Twilic.newSessionEncoder()`             | Create stateful session encoder |

## Value constructors

| Function                | Type             |
| ----------------------- | ---------------- |
| `newNull()`             | null             |
| `newBool(boolean)`      | boolean          |
| `newI64(long)`          | signed integer   |
| `newU64(long)`          | unsigned integer |
| `newF64(double)`        | float            |
| `newString(String)`     | string           |
| `newBinary(byte[])`     | binary           |
| `newArray(List<Value>)` | array            |
| `newMap(MapEntry...)`   | map              |
| `entry(String, Value)`  | map entry helper |
| `equal(Value, Value)`   | deep equality    |

## Session encoder

```java
import io.twilic.Twilic;
import io.twilic.internal.core.SessionEncoder;
import io.twilic.internal.core.Value;

SessionEncoder enc = Twilic.newSessionEncoder();

byte[] full = enc.encode(currentState);
byte[] patch = enc.encodePatch(updatedState);
Value decoded = enc.decode(incomingFrame);

enc.reset(); // after disconnect — next encode is full frame
```

### Session options

Configure via `SessionEncoder` constructor or options object (see SDK source for `UnknownReferencePolicy`).

## Schema (Bound profile)

```java
import io.twilic.internal.core.Schema;
import io.twilic.internal.core.SchemaField;

Schema schema = new Schema(
    1L,                          // schema_id
    "UserRecordV1",              // name
    List.of(
        new SchemaField(1, "id", "u64", true, null),
        new SchemaField(2, "name", "string", true, null)
    )
);

byte[] encoded = Twilic.encodeWithSchema(schema, value);
```

## Key and base references

For advanced patch construction:

```java
Twilic.keyRefLiteral("fieldName");
Twilic.keyRefID(42L);
Twilic.baseRefPrevious();
Twilic.baseRefID(7L);
```

## Error handling

Decode failures throw `TwilicException` with error kind matching the wire spec:

| Kind                         | Meaning                               |
| ---------------------------- | ------------------------------------- |
| `UnexpectedEof`              | Truncated payload                     |
| `InvalidKind` / `InvalidTag` | Corrupt wire data                     |
| `UnknownReference`           | Missing session base                  |
| `StatelessRetryRequired`     | Policy triggered — request full frame |

## Interop

Java encodes payloads readable by all other official SDKs. Run cross-language tests:

```bash
cd twilic-java
./gradlew test
```

## Related

- [Value & Schema](/reference/value-and-schema)
- [Session Encoder](/reference/session-encoder)
- [Interop guide](/guide/interop)
- [Java SDK overview](/sdks/java)
