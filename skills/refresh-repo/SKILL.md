---
name: refresh-repo
description: Refreshes repository context when files may have been manually edited by the user. Use when the user says refresh-repo, asks to refresh memory, mentions manual edits, or when prior context may be stale.
disable-model-invocation: true
---

# Refresh Repo Context

Use this skill when the repository state may have changed outside the current agent context and stale memory could cause incorrect edits or analysis.

## Instructions

1. Treat previous code memory as potentially stale once this skill is invoked.
2. Determine refresh scope first:
   - If the user gave file paths or line ranges, refresh those first.
   - If scope is unclear, ask for target files or infer likely files from the current task.
3. Re-read current source of truth from disk before any reasoning that depends on code content:
   - Use `ReadFile` for known files.
   - Use `rg`/`Glob` to relocate symbols or files if paths may have changed.
4. Do not trust earlier snippets, summaries, or cached assumptions when they conflict with newly read content.
5. After refreshing, briefly state which files/sections were reloaded, then continue the requested task.
6. Before final output for substantial edits, re-read the modified sections once to ensure the response matches latest file content.

## Quick Checklist

- [ ] Refresh scope is explicit.
- [ ] Relevant files were re-read from disk.
- [ ] Stale assumptions were discarded.
- [ ] Response is based on latest content.
