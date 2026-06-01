# Swift SDK

The Swift package provides Twilic v2 encoding and decoding with codec spec vector tests. Session and full protocol APIs are under active development.

## Requirements

- Swift 5.9 or later
- macOS 13+ / iOS 15+ (per `Package.swift`)

## Install

Swift Package Manager:

```swift
dependencies: [
    .package(url: "https://github.com/twilic/twilic-swift.git", from: "0.1.0"),
]
```

## Quick Start

```swift
import Twilic

let value = newMap([
    entry("id", newU64(1001)),
    entry("name", newString("alice")),
    entry("score", newF64(98.6)),
])

let data = try encode(value)
let decoded = try decode(data)
```

## API Reference

### Dynamic Encoding

```swift
encode(value)  // Data
decode(bytes)  // value tree
```

## Project Layout

```text
twilic-swift/
  Sources/Twilic/        # library sources
  Tests/TwilicTests/
  Package.swift
  docs/
```

## Source

[github.com/twilic/twilic-swift](https://github.com/twilic/twilic-swift)
