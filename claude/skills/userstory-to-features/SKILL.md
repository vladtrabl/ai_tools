---
name: userstory-to-features
description: Decomposes a User Story into a minimal set of implementable features (tasks) based on the story title/description and the codebase structure. Use when the user asks to split or decompose a user story into features, or uses phrases such as "розбий сторі на фічі", "розбити user story на фічі", "декомпозиція сторі", "розбий історію на таски", "decompose user story", "split story into features", "break down user story", "user story to features", or provides a story title/description for decomposition.
---

# User Story to Features

Decompose a user story into a small set of implementable features based on the story content **and** the actual repository structure. Output a structured decomposition with names, descriptions, DoD, priority, estimates, and dependencies. Do **not** output code or pseudocode.

## When to use

- **Ukrainian:** "Розбий сторі на фічі: <опис сторі>", "Розбити user story на фічі", "Декомпозиція сторі", "Розбий історію на таски/фічі".
- **English:** "Decompose this user story into features", "Split story into features", "Break down user story", "User story to features" + story title/description.

### Depth modifiers

| Modifier | Trigger phrases | Effect |
|---|---|---|
| (none) | default | Tier 1 — lightweight, no subagents |
| `--deep` | "детально", "deep", "with analysis", "глибокий аналіз" | Tier 2 — analyst subagent before decomposition |
| `--arch` | "з архітектурою", "with architecture", "архітектура" | Tier 3 — analyst + architect subagents in parallel |

### Example prompts

- Розбий сторі на фічі: [далі опис сторі]
- Декомпозуй цю user story детально: як користувач я хочу...
- Decompose this user story with architecture: [story description]
- Split the following story into implementable features --deep

---

## Analysis depth

### Tier 1: Lightweight (default)

The chat performs all analysis itself — parse story, inspect repository, propose features, validate. No subagents. Fast and cheap. Use for simple stories (1 module, clear scope, 3-5 features).

### Tier 2: Analyst-enhanced (`--deep`)

Before decomposition, invoke the **analyst** subagent via the Agent tool:

```
Agent(subagent_type="analyst", prompt="""
Analyze this user story for decomposition into implementable features.

Story title: {story_title}
Story description: {story_description}
Project root: {project_root}

Focus on:
- Requirements clarity: what is explicit, what is ambiguous, what is missing
- Existing patterns in the codebase that relate to this story
- Risks and edge cases that affect how features should be split
- Dependencies between potential deliverables
- Cross-cutting concerns (auth, validation, persistence, events, background jobs)
- Parallelization opportunities: which parts are independent

Do NOT plan implementation steps. Do NOT propose features — only analyze the story.
Return TOON response format.
""")
```

Use the analyst's TOON response (especially: Existing Patterns Found, Risks, Dependencies, Edge Cases) as input for decomposition. Cite specific findings in feature descriptions and Notes where relevant.

**When to auto-suggest Tier 2:** If the story mentions 3+ modules, external integrations, or the description exceeds 500 characters and contains ambiguous requirements — suggest: *"This story looks complex. Consider running with `--deep` for analyst-enhanced analysis."* Do not upgrade automatically.

### Tier 3: Full analysis (`--arch`)

Invoke **analyst** and **architect** subagents **in parallel** (single message, two Agent tool calls):

- **Analyst prompt:** Same as Tier 2.
- **Architect prompt:**

```
Agent(subagent_type="architect", prompt="""
Assess architecture impact of this user story for feature decomposition.

Story title: {story_title}
Story description: {story_description}
Project root: {project_root}

Focus on:
- Which components, layers, and bounded contexts are affected
- Data flow for the proposed functionality (include Mermaid diagram)
- Component interactions (include Mermaid diagram)
- Layer boundary implications (Clean Architecture)
- New vs existing infrastructure (databases, queues, external APIs)
- Risks: scalability, failure points, coupling concerns

Do NOT propose features or plan implementation. Focus on architecture assessment.
Return TOON response format.
""")
```

Use both responses to enrich decomposition. Architect findings inform Scope assignments, dependency ordering, and cross-cutting concerns.

---

## Execution sequence

1. **Extract** story title and description from the user message.
2. **Detect depth modifier** — check for `--deep`, `--arch`, or trigger phrases. Default to Tier 1.
3. **If Tier 2:** invoke analyst subagent, wait for response.
4. **If Tier 3:** invoke analyst + architect subagents in parallel, wait for both.
5. **Inspect** the repository: solution file(s), project folders, API/Web/UI projects, domain/infrastructure boundaries, similar functionality.
6. **Apply** mandatory analysis steps (parse story, map to codebase, propose features, validate) using subagent findings as additional input.
7. **Output** the strict Markdown decomposition.
8. **Post-decomposition checkpoint** — ask the user about file creation.

---

## Inputs

- **story_title** (required) — from the user's message or "Title: ..." in the story text
- **story_description** (required) — the body of the story
- **pre_estimate_hours** (optional) — if provided, keep total estimate within +/-20% or explain in Notes
- **depth** (optional) — `--deep` or `--arch`, detected from trigger phrases
- **repository_context**: **Required.** Inspect the codebase before writing features: solution/project structure, key modules, API vs UI, layers, existing similar features.

---

## Core rules

- **Language:** Write ALL feature names and descriptions in the **same language** as the user's request (Ukrainian or English). Detect automatically.
- **Consistency:** Features must NOT contradict the user story. If something is unclear, add a short "Assumptions" list at the end (max 5 bullets).
- **Minimalism:** Prefer **3-7 features** total. Do not over-split. Group logically to reduce branching/merging and simplify QA.
- **Separation:** Split by deliverable (e.g. API vs UI, Dispatch vs DispatchHardware) only when it meaningfully changes execution or testing responsibility.
- **No implementation details:** No code, pseudocode, or low-level steps. You may reference impacted areas (API/UI/module names) at a high level only.
- **Each feature MUST include:** Name, Description, Dependencies, Scope, Order, Priority, Estimate, DoD.
- **Estimates:** Realistic hours with 0.5h precision. Sum into "Total estimate". If pre_estimate_hours given, stay within +/-20% or explain in Notes.
- **Priorities:**
  - **P0** = critical path / blocks others / required for core acceptance
  - **P1** = important but not blocking core flow
  - **P2** = nice-to-have / polish / optional
- **DoD:** Must be verifiable. Include acceptance criteria coverage, validations, error states, logging/telemetry if relevant, readiness for QA. Not "done when done".

---

## Mandatory analysis steps (internal; do not output as a long essay)

1. **Parse story:** From title/description extract — actors, user goal, scope, constraints, acceptance criteria (if any), non-goals (if implied).
2. **Inspect repository:** Map where changes belong:
   - Where similar functionality already exists
   - Which projects/modules are affected (API, UI, shared, hardware, etc.)
   - Cross-cutting: auth, permissions, validation, persistence, events, background jobs, integrations
3. **Propose minimal feature set:**
   - Each feature = deliverable increment
   - Sensible execution order (dependencies first)
   - Explicit dependencies between features
   - QA can test features in a coherent flow
4. **Map acceptance criteria:** Each AC from the story must map to at least one feature. If an AC has no feature — something is missing.
5. **Identify cross-cutting concerns:** List any auth, migration, background job, messaging, or infrastructure changes that span multiple features.
6. **Validate:** Combined features fully satisfy the story. Call out missing info only as Assumptions (max 5).

---

## Output format (STRICT Markdown)

Return **only** the following. No preamble or extra commentary.

```markdown
Title: <story_title>
Story Description: <story_description>

Features:
1. Feature: <feature name>
   Description: <2-4 sentences, clear, user-story aligned>
   Dependencies: none | #N, #M
   Scope: <API/UI/Both/Dispatch/DispatchHardware/etc. -- short>
   Order: 1
   Priority: P0|P1|P2
   Estimate: <Xh>
   DoD:
   - <verifiable item 1>
   - <verifiable item 2>
   - <...>

2. Feature: ...
   Dependencies: #1
   ...

Total estimate: <sum>h

Acceptance Criteria Coverage:
- AC1: "<acceptance criterion text>" -> Feature #N, #M
- AC2: "<acceptance criterion text>" -> Feature #K
- <...>

Cross-cutting concerns:
- <concern>: Features #N, #M -- <short description>
- <...>

Notes (optional, short):
- <only if needed: estimate mismatch rationale, risks, dependencies>

Assumptions (optional, max 5):
- <only if story missing critical details; keep short>
```

### Field: Dependencies

- `none` — this feature has no dependencies on other features
- `#1` — depends on Feature #1
- `#1, #3` — depends on Features #1 and #3
- Features with no mutual dependencies can be implemented in parallel

### Section: Acceptance Criteria Coverage

Map each acceptance criterion (explicit or derived from the story) to the feature(s) that satisfy it. If an AC is not covered by any feature, add a missing feature or document it in Assumptions.

If the story has no explicit acceptance criteria, derive 3-5 from the story description and map them.

### Section: Cross-cutting concerns

List any concerns that span multiple features or require infrastructure/deployment coordination:
- **Authorization** — new permission checks or roles
- **DB migration** — new tables, columns, or schema changes
- **Background job** — new scheduled/queued jobs
- **Messaging/events** — new event types or handlers
- **External integration** — new API calls to external systems
- **Infrastructure** — new queues, caches, storage

Omit this section only if no cross-cutting concerns exist.

---

## Post-decomposition checkpoint

After outputting the decomposition, **always** ask the user:

```
Decomposition complete (N features, total estimate Xh).

What would you like to do?
(a) Save feature descriptions to a file
(b) Generate architecture documentation (diagrams, components, data flow)
(c) Save both files
(d) Done -- no files needed
```

Translate the checkpoint message to match the story language (Ukrainian or English).

### Option (a): Save features file

Write the decomposition output to `docs/features/<story-slug>.md`.

The slug is derived from the story title: lowercase, spaces replaced with hyphens, non-alphanumeric characters removed, max 50 characters. Example: "User can create dispatch" -> `user-can-create-dispatch`.

If `docs/features/` does not exist, create it.

### Option (b): Generate architecture documentation

If the decomposition was run at **Tier 3** (architect subagent was already invoked):
- Use the architect's response to generate the architecture file.

If the decomposition was run at **Tier 1 or Tier 2** (no architect):
- Invoke the architect subagent now (lazy call) with the decomposition context:

```
Agent(subagent_type="architect", prompt="""
Generate architecture documentation for this set of features derived from a user story.

Story title: {story_title}
Story description: {story_description}
Features: {decomposition_output}
Project root: {project_root}

Produce:
- Feature Overview: what problem is solved and why
- Architecture Context: where this fits in the broader system
- Component Diagram (Mermaid): affected components and their interactions
- Data Flow Diagram (Mermaid): how data moves through the system for this story
- Affected layers and modules
- Dependencies: external systems, libraries, infrastructure requirements
- Risks: constraints, failure points, scalability concerns

Return TOON response format.
""")
```

Write the architecture documentation to `docs/architecture/<story-slug>-architecture.md`.

Architecture file structure:

```markdown
# Architecture: <story_title>

## Feature Overview
<what problem is solved and why>

## Architecture Context
<where this fits in the broader system>

## Component Diagram
```mermaid
<component diagram from architect>
```

## Data Flow
```mermaid
<data flow diagram from architect>
```

## Affected Layers and Modules
<list of affected layers, modules, bounded contexts>

## Dependencies
<external systems, libraries, infrastructure>

## Risks
<constraints, failure points, scalability concerns>
```

If `docs/architecture/` does not exist, create it.

### Option (c): Save both

Execute options (a) and (b) sequentially.

### Option (d): Done

No files created. End the skill execution.

---

## TOON output mode (pipeline)

When this skill is invoked programmatically by another skill or command (not directly by the user), output TOON instead of Markdown:

```
status: success
summary: Decomposed "Story Title" into N features, total Xh
details: <full Markdown decomposition>
artifacts[N|]{name|dependencies|scope|order|priority|estimate}:
  Feature name 1|none|API|1|P0|4h
  Feature name 2|#1|Both|2|P1|6h
  Feature name 3|#1, #2|UI|3|P1|3h
issues[0]:
next_step_recommendation: none
```

This makes the skill composable with other agent workflows.

---

## Quality bar

- **Names:** Short, action-oriented.
- **Descriptions:** Understandable to dev + QA without extra context; must not contradict the story.
- **DoD:** Testable; not vague.
- **Dependencies:** Explicit; enable parallel implementation planning.
- **AC Coverage:** Every acceptance criterion mapped to at least one feature.
- **Single increment:** If backend + frontend are inseparable for one QA-checkable flow, prefer one feature with Scope "Both" instead of splitting into two.

---

## Repository context

If the user does not provide repository_context, **infer from the codebase**: list solution/project structure, main modules, API vs UI, and any multi-project boundaries (e.g. Dispatch vs DispatchHardware). Use this only to assign Scope and Order; do not dump the analysis into the output.
