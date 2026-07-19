# R SDK

The R package provides a full Twilic v2 implementation (v3 support pending) with dynamic, schema-aware, batch, and session encoding.

## Requirements

- R 4.4 or later

## Install

From source:

```r
install.packages("testthat") # for tests
# clone https://github.com/twilic/twilic-r and run:
# R CMD INSTALL .
```

During development:

```r
pkgload::load_all(".")
```

## Quick Start

```r
library(twilic)

value <- new_map(
  entry("id", new_u64(1001)),
  entry("name", new_string("alice")),
  entry("score", new_f64(98.6))
)

bytes <- encode(value)
decoded <- decode(bytes)
stopifnot(equal(decoded, value))
```

## API Reference

### Dynamic Encoding

```r
encode(value)   # raw vector
decode(bytes)   # value
```

### Codec Object

```r
codec <- new_twilic_codec()
codec$encode_value(value)
codec$decode_value(bytes)
codec$encode_with_schema(value, schema)
codec$encode_batch(records)
```

### Session Encoder

```r
enc <- new_session_encoder()
enc$encode(value)
enc$reset()
```

## Value Model

Values are R6-like reference objects created with `new_u64`, `new_string`, `new_map`, `new_array`, and related constructors. Use `equal()` for structural comparison.

## Project Layout

```text
twilic-r/
  R/                  # wire, model, codec, session, protocol, v2
  tests/testthat/     # testthat v3 spec tests
  inst/interop/       # Rust interop emit/decode scripts
  scripts/            # interop smoke checks
```

## Source

[github.com/twilic/twilic-r](https://github.com/twilic/twilic-r)
