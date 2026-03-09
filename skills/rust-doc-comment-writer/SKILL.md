---
name: rust-doc-comment-writer
description: Generate or refine concise English Rust documentation comments for a given item (struct, enum, function, trait, or module) based on its definition and nearby usage in the current project. Use when the user asks to write or rewrite doc comments for a specific item name or file span.
---

# Rust Doc Comment Writer

## Instructions

When the user asks to **write or rewrite English documentation comments** for a Rust item:

1. **Identify the target item**
   - The user will usually reference:
     - An item name (e.g. `MergeSet`, `Duration`, `Clock`), or
     - A file path with a line range (e.g. `@crates/taosim-core/src/chrono.rs:3-8`).
   - Locate the item definition using the provided path or by searching for the name.

2. **Understand the item’s intent**
   - Read the full item definition, including:
     - Struct/enum/trait/module body
     - Associated `impl` blocks
     - Public methods and associated constants
   - If needed, search for **usages of the item** in the workspace (e.g. via `Grep` or SemanticSearch) to infer:
     - What the item represents
     - How it is typically used
     - Any performance or semantic expectations (queue-like, set-like, time units, etc.).

3. **Draft clear, concise doc comments**
   - Write comments in **English**, focused on:
     - **What** the item is (its conceptual role)
     - **How** it behaves or is intended to be used
     - Any important invariants or caveats that callers should know.
   - Follow these style guidelines:
     - Use a single-sentence summary line for the main item, starting with a verb or noun phrase.
     - Keep comments **short and information-dense**, avoiding redundancy with the code.
     - Prefer neutral, descriptive language over narrative explanations.
     - Use Rust doc comment style (`///` on items and fields, `//!` at module level).
   - For numeric or unit-bearing types (e.g. time durations), state:
     - The **unit** (e.g. picoseconds, bytes per second)
     - Any conversion expectations exposed by the API.

4. **Cover relevant members**
   - For **structs**:
     - Document the struct itself.
     - Document key fields that are visible within the crate or public API, especially when their meaning is not obvious from the type alone.
   - For **enums**:
     - Document the enum itself.
     - Document each variant, clarifying when each variant is used.
   - For **functions / methods / associated functions**:
     - Summarize what the function does and any important side effects or invariants.
     - Mention non-obvious parameter meanings and return value semantics (e.g. saturation, truncation, units).
   - For **modules**:
     - Use `//!` at the top of the file to describe the overall purpose and scope.

5. **Respect existing semantics**
   - Do **not** change item behavior; only improve comments.
   - Align documentation with:
     - Existing method names and signatures
     - Serialization formats (e.g. if a type serializes as `u64` picoseconds, mention that)
     - Operator overloads (`Add`, `Div`, `BitOr`, etc.) and how they are used.

6. **Be explicit when merging or saturating**
   - If an API performs non-obvious operations (e.g. saturating arithmetic, non-de-duplicating merges):
     - Call this out explicitly in the doc comments.
     - Clarify how it differs from a typical set or arithmetic type if that might surprise users.

7. **Preserve project tone and brevity**
   - Match the tone of existing comments in the project: concise, technical, and to the point.
   - Avoid over-explaining general Rust concepts the reader likely already knows.
   - Do not add comments that merely restate obvious facts from the code (e.g. "Increments the counter" for `fn inc(&mut self)`).

## Examples

- **Duration in picoseconds**
  - Item: `Duration` representing a time span stored as `u64` ticks.
  - Good top-level doc:
    - "A time duration measured in picoseconds (1 ps = 1e-12 seconds)."
  - Good field doc:
    - "The raw duration value in picoseconds."

- **Merge-friendly set wrapper**
  - Item: `MergeSet<T>` wrapping a `Vec<T>` with small-cardinality, merge-heavy usage.
  - Good top-level doc:
    - "A small, merge-friendly set-like collection."
    - Briefly explain insertion-order, uniqueness via `insert`/`extend`, and that `|`/`|=` behave as concatenating merges.

When in doubt, favor **short, precise summaries** that encode the important semantics a caller must know to use the item correctly.

