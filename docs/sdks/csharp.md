# C# SDK

The C# library provides Twilic v2 dynamic encoding and decoding. Session and full protocol parity with the Java reference are still expanding; see the repository for current coverage.

## Requirements

- .NET 8 SDK

## Install

From GitHub (when published to NuGet, use `dotnet add package Twilic`):

```bash
git clone https://github.com/twilic/twilic-csharp.git
cd twilic-csharp
dotnet build
```

## Quick Start

```csharp
using Twilic;

var value = Twilic.NewMap(
    Twilic.Entry("id", Twilic.NewU64(1001)),
    Twilic.Entry("name", Twilic.NewString("alice")),
    Twilic.Entry("score", Twilic.NewF64(98.6)));

byte[] bytes = Twilic.Encode(value);
var decoded = Twilic.Decode(bytes);
```

## API Reference

### Dynamic Encoding

```csharp
Twilic.Encode(value);  // byte[]
Twilic.Decode(bytes);   // value tree
```

### Schema-Aware Encoding

```csharp
Twilic.EncodeWithSchema(value, schema);
```

### Batch Encoding

```csharp
Twilic.EncodeBatch(records);
```

## Project Layout

```text
twilic-csharp/
  src/Twilic/            # public API + Core/*
  tests/
  scripts/               # Rust interop fixtures and smoke checks
  docs/
```

## Source

[github.com/twilic/twilic-csharp](https://github.com/twilic/twilic-csharp)
