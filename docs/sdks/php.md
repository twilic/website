# PHP SDK

The PHP library provides a full Twilic v2 implementation with dynamic, schema-aware, batch, and stateful encoding.

## Requirements

- PHP 8.3 or later
- [Composer](https://getcomposer.org/)

## Install

From GitHub (until published on Packagist):

```bash
composer require twilic/twilic:@dev
```

## Quick Start

```php
<?php

require 'vendor/autoload.php';

use function Twilic\decode;
use function Twilic\encode;
use function Twilic\entry;
use function Twilic\new_map;
use function Twilic\new_string;
use function Twilic\new_u64;

$value = new_map(
    entry('id', new_u64(1001)),
    entry('name', new_string('alice')),
    entry('score', new_u64(98)),
);

$data = encode($value);
$decoded = decode($data);
```

## API Reference

### Dynamic Encoding

```php
encode($value);  // string (binary)
decode($data);   // value tree
```

### Schema-Aware Encoding

```php
encode_with_schema($value, $schema);
```

### Batch Encoding

```php
encode_batch($records);
```

## Project Layout

```text
twilic-php/
  src/Twilic/          # wire, model, codec, session, v2
  tests/
  scripts/             # Rust interop fixtures and smoke checks
  bin/                 # interop CLI helpers
  docs/
```

## Source

[github.com/twilic/twilic-php](https://github.com/twilic/twilic-php)
