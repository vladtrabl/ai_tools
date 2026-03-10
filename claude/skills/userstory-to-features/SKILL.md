---
name: userstory-to-features
description: Decomposes a User Story into a minimal set of implementable features (tasks) based on the story title/description and the codebase structure. Use when the user asks to split or decompose a user story into features, or uses phrases such as "розбий сторі на фічі", "розбити user story на фічі", "декомпозиція сторі", "розбий історію на таски", "decompose user story", "split story into features", "break down user story", "user story to features", or provides a story title/description for decomposition.
---

# User Story to Features

Decompose a user story into a small set of implementable features based on the story content **and** the actual repository structure. Output a structured decomposition with names, descriptions, DoD, priority, and estimates. Do **not** output code or pseudocode.

## When to use

- **Ukrainian:** "Розбий сторі на фічі: &lt;опис сторі&gt;", "Розбити user story на фічі", "Декомпозиція сторі", "Розбий історію на таски/фічі".
- **English:** "Decompose this user story into features", "Split story into features", "Break down user story", "User story to features" + story title/description.

### Example prompts (Ukrainian)

- Розбий сторі на фічі: [далі опис сторі]
- Декомпозуй цю user story: як користувач я хочу...
- Розбити історію на фічі з оцінкою та DoD

### Example prompts (English)

- Decompose this user story into features: [story description]
- Split the following story into implementable features...
- Break down user story with DoD and estimates

## Execution sequence

1. **Extract** story title and description from the user message (e.g. text after "розбий сторі на фічі:" or "decompose:").
2. **Inspect** the repository: solution file(s), project folders, API/Web/UI projects, domain/infrastructure boundaries, and where similar functionality lives.
3. **Apply** the mandatory analysis steps (parse story → map to codebase → propose features → validate).
4. **Output** only the strict Markdown decomposition; no extra commentary.

## Inputs

- **story_title** (required) — from the user's message or "Title: ..." in the story text
- **story_description** (required) — the body of the story (e.g. after "розбий сторі на фічі:" or "description:")
- **pre_estimate_hours** (optional) — if provided, keep total estimate within ±20% or explain in Notes
- **repository_context**: **Required.** Before writing features, inspect the codebase: solution/project structure, key modules, API vs UI, layers (e.g. Clean Architecture), existing similar features. Use this to assign Scope and Order; do not output the analysis as a long essay.

## Core rules

- **Language:** Write ALL feature names and descriptions in the **same language** as the user's request (Ukrainian or English). Detect automatically.
- **Consistency:** Features must NOT contradict the user story. If something is unclear, add a short "Assumptions" list at the end (max 5 bullets).
- **Minimalism:** Prefer **3–7 features** total. Do not over-split. Group logically to reduce branching/merging and simplify QA.
- **Separation:** Split by deliverable (e.g. API vs UI, Dispatch vs DispatchHardware) only when it meaningfully changes execution or testing responsibility.
- **No implementation details:** No code, pseudocode, or low-level steps. You may reference impacted areas (API/UI/module names) at a high level only.
- **Each feature MUST include:** Name, Description (2–4 clear sentences), DoD (bullet list), Priority (P0/P1/P2), Estimate (hours), Order (1..N).
- **Estimates:** Realistic hours with 0.5h precision. Sum into "Total estimate". If pre_estimate_hours given, stay within ±20% or explain in Notes.
- **Priorities:**
  - **P0** = critical path / blocks others / required for core acceptance
  - **P1** = important but not blocking core flow
  - **P2** = nice-to-have / polish / optional
- **DoD:** Must be verifiable. Include acceptance criteria coverage, validations, error states, logging/telemetry if relevant, readiness for QA. Not "done when done".

## Mandatory analysis steps (internal; do not output as a long essay)

1. **Parse story:** From title/description extract — actors, user goal, scope, constraints, acceptance criteria (if any), non-goals (if implied).
2. **Inspect repository:** Map where changes belong:
   - Where similar functionality already exists
   - Which projects/modules are affected (API, UI, shared, hardware, etc.)
   - Cross-cutting: auth, permissions, validation, persistence, events, background jobs, integrations
3. **Propose minimal feature set:**
   - Each feature = deliverable increment
   - Sensible execution order (dependencies first)
   - QA can test features in a coherent flow
4. **Validate:** Combined features fully satisfy the story. Call out missing info only as Assumptions (max 5).

## Output format (STRICT Markdown)

Return **only** the following. No preamble or extra commentary.

```markdown
Title: <story_title>
Story Description: <story_description>

Features:
1. Feature: <feature name>
   Description: <2–4 sentences, clear, user-story aligned>
   Scope: <API/UI/Both/Dispatch/DispatchHardware/etc. — short>
   Order: 1
   Priority: P0|P1|P2
   Estimate: <Xh>
   DoD:
   - <verifiable item 1>
   - <verifiable item 2>
   - <...>

2. Feature: ...
   ...

Total estimate: <sum>h

Notes (optional, short):
- <only if needed: estimate mismatch rationale, risks, dependencies>

Assumptions (optional, max 5):
- <only if story missing critical details; keep short>
```

## Quality bar

- **Names:** Short, action-oriented.
- **Descriptions:** Understandable to dev + QA without extra context; must not contradict the story.
- **DoD:** Testable; not vague.
- **Single increment:** If backend + frontend are inseparable for one QA-checkable flow, prefer one feature with Scope "Both" instead of splitting into two.

## Repository context

If the user does not provide repository_context, **infer from the codebase**: list solution/project structure, main modules, API vs UI, and any multi-project boundaries (e.g. Dispatch vs DispatchHardware). Use this only to assign Scope and Order; do not dump the analysis into the output.

## Deliverable

Return **only** the formatted decomposition (Title, Story Description, Features 1..N, Total estimate, optional Notes, optional Assumptions). No extra commentary before or after.
