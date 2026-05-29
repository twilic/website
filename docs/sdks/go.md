# Go SDK

The Go module provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- Go 1.22 or later

## Install

```bash
go get github.com/twilic/twilic-go
```

## Quick Start

```go
package main

import (
    "fmt"

    twilic "github.com/twilic/twilic-go"
)

func main() {
    value := twilic.NewMap(
        twilic.Entry("id", twilic.NewU64(1001)),
        twilic.Entry("name", twilic.NewString("alice")),
        twilic.Entry("score", twilic.NewF64(98.6)),
    )

    bytes, err := twilic.Encode(value)
    if err != nil {
        panic(err)
    }

    decoded, err := twilic.Decode(bytes)
    if err != nil {
        panic(err)
    }

    fmt.Println(decoded)
}
```

## API Reference

### Dynamic Encoding

```go
// Encode any Value to bytes (Dynamic Profile)
func Encode(v Value) ([]byte, error)

// Decode bytes to a Value
func Decode(b []byte) (Value, error)
```

### Schema-Aware Encoding

```go
// Encode using Bound Profile
func EncodeWithSchema(v Value, schema *Schema) ([]byte, error)
```

### Batch Encoding

```go
// Encode a slice of same-shape records
func EncodeBatch(records []Value) ([]byte, error)
```

### Session Encoder

```go
enc := twilic.NewSessionEncoder()

// Encode with persistent session state
bytes, err := enc.Encode(value)

// Encode a micro-batch
bytes, err := enc.EncodeMicroBatch(records)

// Reset session state
enc.Reset()
```

## Value Construction

```go
twilic.NewNull()
twilic.NewBool(true)
twilic.NewU64(1001)
twilic.NewI64(-42)
twilic.NewF64(3.14)
twilic.NewString("hello")
twilic.NewBinary([]byte{0x01, 0x02})
twilic.NewArray(twilic.NewU64(1), twilic.NewU64(2))
twilic.NewMap(
    twilic.Entry("key", twilic.NewString("value")),
)
```

## Project Layout

```text
twilic-go/
  export.go, version.go          # public import path
  internal/core/                 # wire, model, codec, session, protocol, v2, tests
  scripts/                       # Rust interop fixtures and smoke checks
  docs/
```

The repository root stays thin. Import `github.com/twilic/twilic-go` only. Implementation details live under `internal/core/`.

## Source

[github.com/twilic/twilic-go](https://github.com/twilic/twilic-go)
