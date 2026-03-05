---
name: conventional-commit-from-diff
description: Analyze current workspace changes (git diff) and generate a single English Conventional Commit message (header + optional body) that best summarizes the modifications. Use when the user asks to write or refine a Conventional Commit message based on the current changes.
---

# Conventional Commit From Diff

## Instructions

When asked to "根据当前工作区的修改内容撰写符合 Conventional Commit 格式的英文 commit message" (write a Conventional Commit message from current workspace changes), follow this workflow:

1. **Inspect changes**
   - Run `git status -sb` to see which files changed.
   - Run `git diff` (or `git diff --cached` if the user specifies staged changes) to inspect modifications.

2. **Understand the intent of changes**
   - For each file, quickly categorize what kind of change it is:
     - New behavior / new API / new configuration surface
     - Bug fix / regression fix
     - Pure internal refactor, no behavioral change intended
     - Docs only
     - Tests only
     - Build / CI / tooling / dependencies
     - Style / formatting only
   - Focus on **observable impact**: APIs, config formats, behavior, output, or external contracts.

3. **Choose a single primary type**

   Choose exactly one type from this list, based on the **dominant intent** of the overall change set:

   - `feat`: New feature, new visible behavior, new configuration option, or new public API surface.
   - `fix`: Bug fix, regression fix, incorrect behavior corrected.
   - `refactor`: Internal code restructuring with no intended behavioral change; not performance, not feature.
   - `chore`: Build/config/tooling/dependency changes; or "misc" that doesn’t fit other types and has no user-visible effect.
   - `docs`: Documentation-only changes.
   - `test`: Test files added/changed without modifying production code.
   - `ci`: Continuous integration/config for pipelines, workflows.
   - `style`: Formatting or stylistic-only changes (whitespace, forma
   Rules of thumb:
   - If there is any **meaningful new capability or knob** (e.g., new config field, new stats field), prefer **`feat`**.
   - If there is a user-visible bug fix, prefer **`fix`**, even if some refactoring happens with it.
   - If multiple categories are present, pick the one that best represents **why** a consumer would care (feat/fix usually win).

4. **Pick an optional scope**

   - Scope is a short, lower-case noun in parentheses that hints where the change lives.
   - Derive it from module, crate, package, or feature name.
   - Examples: `env`, `cfg`, `cache`, `cli`, `build`, `deps`, `docs`, `tests`, `ci`.
   - If no clear, concise scope stands out, omit the scope.

5. **Write the short description**

   - Format: `<type>[optional scope]: <description>`
   - Description guidelines:
     - Use imperative mood and present tense (e.g., "introduce shared last-level cache").
     - Be concise and specific about the main impact.
     - Avoid low-value words like "stuff", "misc", "update code".
   - Examples:
     - `feat(env): introduce shared last-level cache`
     - `fix(cache): avoid panic on empty stats`
     - `chore(deps): disable indicatif default features`

6. **Write an optional body**

   - Only add a body if it provides extra clarity or context.
   - Use bullet points with `- `.
   - Focus on **why** and high-level **what**, not line-by-line descriptions.
   - Include important details:
     - Architectural/topology changes (e.g., per-core LLC → shared LLC).
     - Changes to configuration formats or statistics outputs.
     - Notable dependency changes (e.g., disabling default features, major-version bumps).
   - Keep each bullet succinct.

7. **Output format**

   - Always output in this exact order:
     1. A single header line.
     2. Optionally, a blank line followed by body lines.
   - Do **not** wrap the final message in backticks in your answer unless the user explicitly wants code fencing.
   - Example final output:

     feat(env): introduce shared last-level cache

   - Refactor core complexes to use a shared LLC instead of per-complex LLCs.
     - Add global LLC stats to phase results.
     - Update default config generation to include a top-level LLC option.
     - Disable default features for indicatif to slim dependencies.

---

## Examples

### Example 1: New shared LLC and stats

**Context (summary of diff):**
- `env.rs`: Change from per-core-complex LLCs to a single shared LLC, aggregate LLC stats in `PhaseStats`.
- `taosim-cfg`: Default config now includes top-level `llc` option.
- `Cargo.toml`: `indicatif` set to `default-features = false`.

**Classification:**
- Main impact: new topology and stats capability → `feat`.
- Scope: `env` (central place where env and shared LLC are configured).

**Recommended commit:**

feat(env): introduce shared last-level cache

- Refactor core complexes to use a shared LLC instead of per-complex LLCs.
- Add global LLC stats to phase results.
- Update default config generation to include a top-level LLC option.
- Disable defau features for indicatif to slim dependencies.

---

### Example 2: Pure dependency tweak

**Context (summary of diff):**
- Only `Cargo.toml` changed, turning off `indicatif` default features to reduce bloat.

**Classification:**
- Pure dependency/build change → `chore`.
- Scope: `deps`.

**Recommended commit:**

chore(deps): disable indicatif default features

- Turn off indicatif default features to reduce unnecessary dependencies.

---

### Example 3: Bug fix without new features

**Context (summary of diff):**
- Fix LLC stats aggregation bug that double-counted hits in ROI stats.
- No new fields, only corrected behavior.

**Classification:**
- User-visible behavior fix → `fix`.
- Scope: `env`.

**Recommendommit:**

fix(env): correct llc stats aggregation

- Fix double-counting of LLC hits in ROI stats.
- Keep sim stats aggregation consistent with ROI stats.

---

## Quick Checklist

Before you output the commit message, verify:

- [ ] You examined `git diff` (and optionally `git status -sb`) to understand the changes.
- [ ] You chose one primary type from: feat, fix, refactor, chore, docs, test, ci, style.
- [ ] The header is in the form `type(scope): description` or `type: description`.
- [ ] The description is short, imperative, and focused on the main impact.
- [ ] The body (if present) adds value with concise bullet points.
