# Scala SDK

The Scala library provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Java 21 or later
- Scala 3.3+
- sbt 1.10+

## Install

sbt:

```scala
libraryDependencies += "io.twilic" %% "twilic" % "3.0.0"
```

Maven:

```xml
<dependency>
  <groupId>io.twilic</groupId>
  <artifactId>twilic_3</artifactId>
  <version>3.0.0</version>
</dependency>
```

Or clone and build from source:

```bash
git clone https://github.com/twilic/twilic-scala.git
cd twilic-scala && sbt test
```

## Quick Start

```scala
import io.twilic.Twilic
import io.twilic.internal.core.*

val value = Twilic.newMap(
  Twilic.entry("id", Twilic.newU64(1001)),
  Twilic.entry("name", Twilic.newString("alice")),
  Twilic.entry("score", Twilic.newF64(98.6)),
)

val bytes = Twilic.encode(value)
val decoded = Twilic.decode(bytes)

println(Twilic.equal(decoded, value))
```

## API Reference

### Dynamic Encoding

```scala
Twilic.encode(value)   // Array[Byte]
Twilic.decode(bytes)   // Value
```

### Schema-Aware Encoding

```scala
Twilic.encodeWithSchema(value, schema)
```

### Batch Encoding

```scala
Twilic.encodeBatch(records)
```

### Session Encoder

```scala
val enc = Twilic.newSessionEncoder()
enc.encode(value)
enc.reset()
```

The public package is `io.twilic`. Protocol core types live under `io.twilic.internal.core` (Java implementation shared with the reference SDK layout).

## Project Layout

```text
twilic-scala/
  src/main/scala/io/twilic/          # public Scala API
  src/main/java/io/twilic/internal/  # protocol core (Java)
  src/test/scala/                    # ScalaTest spec tests
  scripts/                           # Rust interop smoke checks
```

## Source

[github.com/twilic/twilic-scala](https://github.com/twilic/twilic-scala)
