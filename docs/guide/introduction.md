# Introduction

Twilic is a compact binary format for structured data. It keeps MessagePack-like usability — schema-less, self-describing, arbitrary root values — while becoming materially smaller than MessagePack when repeated structure, keys, strings, homogeneous arrays, batching, or session reuse is present.

## Name

Twilic is named after Old English _twilic_, the root of the modern word _twill_.

_Twill_ is a weave built from repeated threads, often forming a diagonal pattern. The name reflects Twilic's core idea: repeated data shapes, keys, and values should not be sent again and again as independent structures, but woven together into a compact binary representation.

In other words, Twilic treats structured data less like isolated messages and more like a fabric of recurring patterns.

The etymology follows [Merriam-Webster](https://www.merriam-webster.com/dictionary/twill), which traces _twill_ to Old English _twilic_ ("having a double thread").

## Design Philosophy

Twilic follows six design principles.

**Usable through the same API.** A dynamic mode encodes/decodes arbitrary values as-is. A compact mode activates when a schema is provided. Both share the same public API surface in every SDK.

**Deferred optimization.** The first transmission may be self-describing. Once repeated shape, key set, string, or field distribution is observed, the encoder automatically switches to a more compact representation.

**Minimal one-shot cost.** Small one-shot values do not pay for control metadata. Control information used for learning or dictionaries must be local and recoverable.

**Decisive wins on repetition.** Shape interning, key interning, string interning, typed vectors, columnar batches, and delta/FOR/RLE/dictionary/XOR codecs compound to produce significant size reductions on realistic workloads.

**Deterministic wire format.** Under the same profile and learning state, the same value always maps to the same bytes. This property makes testing, fuzzing, and interoperability straightforward.

**Optional stateful optimization.** Stateless one-shot messages remain directly usable. Stateful features — patching, shared dictionaries, template reuse — activate only when a session or channel exists and are transparent to receivers that opt out.

## Goals

- Reduce repeated object-key overhead
- Support schema-aware compact encoding when schemas are available
- Support learned structure in dynamic mode
- Support row-wise, columnar, and stateful compression strategies
- Keep deterministic wire behavior within a fixed profile

## Non-Goals

- Replacing every existing JSON or binary protocol
- Defining application semantics
- Mandating a single transport handshake for every deployment

## Current Version

The current release line is **v2**. v2 is a clean break from v1 — a v2 decoder is not required to decode v1 payloads.

- [v2 Specification](/spec/overview)
- [v2 Reference Profile](/spec/v2)
- [v1 (Legacy)](/spec/v1)
