# Dart SDK

The Dart package provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Dart SDK 3.5 or later

## Install

```yaml
dependencies:
  twilic:
    git:
      url: https://github.com/twilic/twilic-dart.git
```

## Quick Start

```dart
import 'package:twilic/twilic.dart';

final value = newMap([
  entry('id', newU64(1001)),
  entry('name', newString('alice')),
  entry('score', newF64(98.6)),
]);

final bytes = encode(value);
final decoded = decode(bytes);
```

## API Reference

### Dynamic Encoding

```dart
encode(value);  // Uint8List
decode(bytes);  // value tree
```

### Schema-Aware Encoding

```dart
encodeWithSchema(value, schema);
```

### Batch Encoding

```dart
encodeBatch(records);
```

## Project Layout

```text
twilic-dart/
  lib/                   # public API + lib/src/*
  test/
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-dart](https://github.com/twilic/twilic-dart)
