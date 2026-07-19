# Kotlin SDK

The Kotlin/JVM library provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- JDK 21 or later
- Gradle 9.4+ (wrapper included)

## Install

From GitHub (when published to Maven Central, use `io.twilic:twilic`):

```kotlin
dependencies {
    implementation("io.twilic:twilic:3.0.0")
}
```

## Quick Start

```kotlin
import io.twilic.Twilic
import io.twilic.internal.core.MapEntry

val value = Twilic.newMap(
    MapEntry("id", Twilic.newU64(1001)),
    MapEntry("name", Twilic.newString("alice")),
    MapEntry("score", Twilic.newF64(98.6)),
)
val encoded = Twilic.encode(value)
val decoded = Twilic.decode(encoded)
```

## API Reference

### Dynamic Encoding

```kotlin
Twilic.encode(value)  // ByteArray
Twilic.decode(bytes)  // value tree
```

### Schema-Aware Encoding

```kotlin
Twilic.encodeWithSchema(value, schema)
```

### Batch Encoding

```kotlin
Twilic.encodeBatch(records)
```

## Project Layout

```text
twilic-kotlin/
  src/main/kotlin/io/twilic/           # public API + v2 wire
  src/main/java/io/twilic/internal/core/  # protocol codec
  src/test/
  scripts/
  docs/
```

## Source

[github.com/twilic/twilic-kotlin](https://github.com/twilic/twilic-kotlin)
