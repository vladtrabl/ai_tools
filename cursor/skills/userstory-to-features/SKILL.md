---
name: userstory-to-features
description: Decomposes a User Story into a small set of implementable features/tasks based on the story title/description and the actual repository code structure. Use when the user (in English or Ukrainian) asks to split or decompose a user story into features, tasks, or deliverable increments.
---

# User Story to Features Decomposition

## Purpose

This skill helps decompose a single User Story into a minimal set of coherent, implementable features (tasks) that align with the existing architecture and code boundaries of the current repository.

The goal is to:
- Preserve the intent of the User Story
- Minimize unnecessary splitting and coordination overhead
- Make each feature testable as a meaningful increment
- Keep estimates realistic and transparent
- Surface dependencies, acceptance criteria coverage, and cross-cutting concerns

## When to Use

Use this skill when the user asks (explicitly or implicitly) to:
- Split or decompose a user story into features/tasks
- "Break user story into features"
- "Decompose user story"
- "Create features from user story"
- "Розбий на фічі юзер сторі"
- "Розбий юзер сторі на фічі"
- "Декомпозуй юзер сторі на задачі/фічі"

Assume the intent is decomposition whenever the user mentions:
- "user story", "story", "epic" together with "features", "tasks", "split", "decompose"
- Ukrainian equivalents like "юзер сторі", "історія користувача", "розбий", "декомпозуй", "фічі", "задачі"

### Depth modifiers

| Modifier | Trigger phrases | Effect |
|---|---|---|
| (none) | default | Tier 1 — lightweight, no subagents |
| `--deep` | "детально", "deep", "with analysis", "глибокий аналіз" | Tier 2 — analyst subagent before decomposition |
| `--arch` | "з архітектурою", "with architecture", "архітектура" | Tier 3 — analyst + architect subagents in parallel |

---

## Analysis Depth

### Tier 1: Lightweight (default)

The chat performs all analysis itself — parse story, inspect repository, propose features, validate. No subagents. Fast and cheap. Use for simple stories (1 module, clear scope, 3-5 features).

### Tier 2: Analyst-enhanced (`--deep`)

Before decomposition, invoke the **analyst** subagent via the Task tool:

```
Task(agent="analyst", prompt="""
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

Invoke **analyst** and **architect** subagents **in parallel**:

- **Analyst prompt:** Same as Tier 2.
- **Architect prompt:**

```
Task(agent="architect", prompt="""
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

## Language Handling

- Automatically detect the primary language of the User Story from `story_title` and/or `story_description` (typically English or Ukrainian).
- Use that same language consistently for:
  - Feature names
  - Feature descriptions
  - DoD bullet items
  - Notes and Assumptions
- Keep the structural labels and keys (`Title`, `Story Description`, `Features`, `DoD`, `Total estimate`, `Notes`, `Assumptions`, `Scope`, `Order`, `Priority`, `Estimate`) in English to preserve a stable template.
- If the story is mixed-language, choose the dominant language of the description.

---

## Inputs Interpretation

When the user asks for decomposition, interpret the request into the following conceptual inputs:

- `story_title` (required): Short, one-line summary of the User Story. If not provided explicitly, derive it from the first sentence or main clause of the user request.
- `story_description` (required): Full narrative of the User Story, including context, acceptance criteria, and any constraints. If only a title is provided, treat it as both title and description.
- `pre_estimate_hours` (optional): If the user mentions a rough estimate (e.g., "around 16 hours", "two days of work"), normalize it to hours and treat it as `pre_estimate_hours`.
- `depth` (optional): `--deep` or `--arch`, detected from trigger phrases.
- `repository_context` (required conceptually): If the user does not explicitly provide it, infer it from the current codebase (project names, solution structure, key modules, UI/API separation, known integrations).
- `code_access` (required conceptually): Always assume access to the repository code via the usual tools; inspect the code to understand where changes should live. Do not output code.

Do not block on missing fields; infer from context and document any important gaps under **Assumptions**.

---

## Execution Sequence

1. **Extract** story title and description from the user message.
2. **Detect depth modifier** — check for `--deep`, `--arch`, or trigger phrases. Default to Tier 1.
3. **If Tier 2:** invoke analyst subagent, wait for response.
4. **If Tier 3:** invoke analyst + architect subagents in parallel, wait for both.
5. **Inspect** the repository: solution file(s), project folders, API/Web/UI projects, domain/infrastructure boundaries, similar functionality.
6. **Apply** mandatory analysis workflow (parse story, map to codebase, propose features, validate) using subagent findings as additional input.
7. **Output** the strict Markdown decomposition.
8. **Post-decomposition checkpoint** — ask the user about file creation.

---

## Mandatory Analysis Workflow

Follow these steps internally before producing the output:

1. **Parse the User Story**
   - Extract actors, user goals, main flow, and any secondary flows.
   - Identify scope boundaries: what is clearly in-scope vs. out-of-scope.
   - Note explicit constraints (performance, security, UX, integrations, SLAs, etc.).
   - Derive implicit non-goals (things clearly not requested).

2. **Inspect Repository and Architecture**
   - Quickly scan the solution/projects to understand:
     - Main applications (e.g., API, UI, background workers, shared libraries, hardware-related projects).
     - Relevant modules, bounded contexts, or feature areas.
   - Look for existing functionality that is similar or adjacent to the story:
     - Reuse patterns and boundaries instead of inventing new ones.
   - Identify cross-cutting concerns that might be affected:
     - Authentication/authorization and permissions
     - Validation and error handling patterns
     - Persistence (ORM, repositories, database schemas)
     - Messaging, events, background jobs
     - Logging, telemetry, and monitoring

3. **Propose a Minimal Feature Set**
   - Aim for **3-7 features** in most cases.
   - Only exceed 7 when the story clearly spans multiple subsystems or products with distinct responsibilities.
   - Prefer combining inseparable backend+frontend work into a single feature with `Scope: Both` to simplify QA and coordination.
   - Split by deliverable or responsibility only when it:
     - Changes execution responsibility (e.g., Dispatch vs DispatchHardware)
     - Changes testing responsibility or environments (e.g., separate deploy paths)
   - Explicitly set dependencies between features.

4. **Map Acceptance Criteria**
   - Each AC from the story must map to at least one feature.
   - If an AC has no feature — add a missing feature or document in Assumptions.
   - If the story has no explicit ACs, derive 3-5 from the story description.

5. **Identify Cross-cutting Concerns**
   - List any auth, migration, background job, messaging, or infrastructure changes that span multiple features.

6. **Validate Completeness and Flow**
   - Ensure the combined features fully satisfy the User Story.
   - Make sure features can be implemented and delivered in a sensible order:
     - Foundations and data contracts first
     - API and domain logic next
     - UI and UX last, if applicable
   - Ensure that QA can test each feature in a coherent scenario, not in artificial isolation.

---

## Feature Design Rules

For each feature you propose:

- **Name**
  - Short, action-oriented, in the same language as the User Story.
  - Describe the outcome, not the implementation detail.

- **Description**
  - 2-4 clear sentences.
  - Explain what this feature delivers and how it contributes to the User Story.
  - Avoid code-level or low-level technical steps.

- **Dependencies**
  - `none` — this feature has no dependencies on other features
  - `#1` — depends on Feature #1
  - `#1, #3` — depends on Features #1 and #3
  - Features with no mutual dependencies can be implemented in parallel.

- **Scope**
  - One of: `API`, `UI`, `Both`, or a short project/area label (e.g., `Dispatch`, `DispatchHardware`, `Background worker`).
  - Prefer `Both` when backend and frontend must move together to be testable.

- **Order**
  - Integer `1..N`, defining recommended implementation sequence.
  - Earlier items should unblock or support later ones.

- **Priority**
  - `P0` -- Critical path, blocks others, required for core acceptance of the story.
  - `P1` -- Important but not blocking the core flow.
  - `P2` -- Nice-to-have, polish, or optional enhancements.

- **Estimate**
  - Realistic effort in hours, with 0.5h precision (e.g., `3h`, `5.5h`).
  - Include analysis, implementation, tests, and basic review.

- **DoD (Definition of Done)**
  - A short bullet list of verifiable outcomes.
  - Focus on:
    - Acceptance criteria coverage
    - Validations and error paths
    - Logging/telemetry (if relevant)
    - Tests (unit/integration/UI as applicable)
    - Readiness for QA and demo

---

## Estimation Rules

- Compute and display a **Total estimate** as the sum of all feature estimates.
- If `pre_estimate_hours` is present:
  - Try to keep total within +/-20% of that value.
  - If that is not realistic, keep your own estimate and briefly explain why in **Notes**.
- If `pre_estimate_hours` is not present:
  - Provide your best realistic estimate and keep **Notes** minimal or empty.

---

## Handling Uncertainty and Assumptions

- Do **not** ask the user to confirm assumptions unless the story is fundamentally ambiguous.
- Instead:
  - Make reasonable, industry-standard assumptions.
  - List only the most important ones (max 5) under **Assumptions**.
  - Phrase them briefly and clearly in the same language as the User Story.

---

## Output Format (STRICT Markdown)

Always respond **only** with the formatted decomposition output below. Do **not** add extra commentary, explanations, or headings before or after it.

Use this exact structure and ordering:

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

2. Feature: <feature name>
   Dependencies: #1
   ...

<...more features as needed...>

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

## Post-decomposition Checkpoint

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
Task(agent="architect", prompt="""
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

## TOON Output Mode (Pipeline)

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

## Quality Bar

Ensure that:
- Feature names are short, action-oriented, and aligned with the User Story.
- Descriptions are understandable to both developers and QA without additional context.
- DoD items are concrete and testable; avoid vague phrases like "done when implemented".
- Dependencies are explicit and enable parallel implementation planning.
- Acceptance criteria are fully covered by features.
- Splitting backend and frontend work into separate features is avoided when it makes QA harder; prefer a single feature with `Scope: Both` when that leads to a cleaner, testable increment.
