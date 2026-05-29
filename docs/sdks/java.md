# Java SDK

The Java library provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Java 21 or later

## Install

Add to `pom.xml` (Maven):

```xml
<dependency>
  <groupId>io.twilic</groupId>
  <artifactId>twilic</artifactId>
  <version>0.1.0</version>
</dependency>
```

Or `build.gradle` (Gradle):

```groovy
implementation 'io.twilic:twilic:0.1.0'
```

## Quick Start

```java
import io.twilic.Twilic;
import io.twilic.Value;

public class Main {
    public static void main(String[] args) throws Exception {
        Value value = Value.map(
            Value.entry("id", Value.u64(1001)),
            Value.entry("name", Value.string("alice")),
            Value.entry("score", Value.f64(98.6))
        );

        byte[] bytes = Twilic.encode(value);
        Value decoded = Twilic.decode(bytes);

        System.out.printf("encoded %d bytes%n", bytes.length);
    }
}
```

## API Reference

### Dynamic Encoding

```java
// Encode any Value to bytes (Dynamic Profile)
public static byte[] encode(Value value) throws TwilicException

// Decode bytes to a Value
public static Value decode(byte[] bytes) throws TwilicException
```

### Schema-Aware Encoding

```java
// Encode using Bound Profile with a shared schema
public static byte[] encodeWithSchema(Value value, Schema schema) throws TwilicException
```

### Batch Encoding

```java
// Encode a list of same-shape records
public static byte[] encodeBatch(List<Value> records) throws TwilicException
```

### Session Encoder

```java
import io.twilic.SessionEncoder;

SessionEncoder enc = new SessionEncoder();

// Encode with persistent session state
byte[] bytes = enc.encode(value);

// Encode a micro-batch
byte[] bytes = enc.encodeMicroBatch(records);

// Reset session state
enc.reset();
```

## Value Construction

```java
Value.nullValue()
Value.bool(true)
Value.u64(1001L)
Value.i64(-42L)
Value.f64(3.14)
Value.string("hello")
Value.binary(new byte[]{0x01, 0x02})
Value.array(Value.u64(1), Value.u64(2))
Value.map(
    Value.entry("key", Value.string("value"))
)
```

## Project Layout

```text
twilic-java/
  src/main/java/io/twilic/            # public API (Twilic.java, Value.java, Version.java)
  src/main/java/io/twilic/internal/   # wire, model, codec, session, protocol, v2
  src/test/java/                      # spec conformance and interop tests
  scripts/                            # Rust interop fixtures and smoke checks
  docs/
```

The public package is `io.twilic`. Implementation details live under `io.twilic.internal.core`.

## Source

[github.com/twilic/twilic-java](https://github.com/twilic/twilic-java)
