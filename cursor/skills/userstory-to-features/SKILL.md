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

## Language Handling

- Automatically detect the primary language of the User Story from `story_title` and/or `story_description` (typically English or Ukrainian).
- Use that same language consistently for:
  - Feature names
  - Feature descriptions
  - DoD bullet items
  - Notes and Assumptions
- Keep the structural labels and keys (`Title`, `Story Description`, `Features`, `DoD`, `Total estimate`, `Notes`, `Assumptions`, `Scope`, `Order`, `Priority`, `Estimate`) in English to preserve a stable template.
- If the story is mixed-language, choose the dominant language of the description.

## Inputs Interpretation

When the user asks for decomposition, interpret the request into the following conceptual inputs:

- `story_title` (required): Short, one-line summary of the User Story. If not provided explicitly, derive it from the first sentence or main clause of the user request.
- `story_description` (required): Full narrative of the User Story, including context, acceptance criteria, and any constraints. If only a title is provided, treat it as both title and description.
- `pre_estimate_hours` (optional): If the user mentions a rough estimate (e.g., "around 16 hours", "two days of work"), normalize it to hours and treat it as `pre_estimate_hours`.
- `repository_context` (required conceptually): If the user does not explicitly provide it, infer it from the current codebase (project names, solution structure, key modules, UI/API separation, known integrations).
- `code_access` (required conceptually): Always assume access to the repository code via the usual tools; inspect the code to understand where changes should live. Do not output code.

Do not block on missing fields; infer from context and document any important gaps under **Assumptions**.

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
   - Aim for **3–7 features** in most cases.
   - Only exceed 7 when the story clearly spans multiple subsystems or products with distinct responsibilities.
   - Prefer combining inseparable backend+frontend work into a single feature with `Scope: Both` to simplify QA and coordination.
   - Split by deliverable or responsibility only when it:
     - Changes execution responsibility (e.g., Dispatch vs DispatchHardware)
     - Changes testing responsibility or environments (e.g., separate deploy paths)

4. **Validate Completeness and Flow**
   - Ensure the combined features fully satisfy the User Story.
   - Make sure features can be implemented and delivered in a sensible order:
     - Foundations and data contracts first
     - API and domain logic next
     - UI and UX last, if applicable
   - Ensure that QA can test each feature in a coherent scenario, not in artificial isolation.

## Feature Design Rules

For each feature you propose:

- **Name**
  - Short, action-oriented, in the same language as the User Story.
  - Describe the outcome, not the implementation detail.

- **Description**
  - 2–4 clear sentences.
  - Explain what this feature delivers and how it contributes to the User Story.
  - Avoid code-level or low-level technical steps.

- **Scope**
  - One of: `API`, `UI`, `Both`, or a short project/area label (e.g., `Dispatch`, `DispatchHardware`, `Background worker`).
  - Prefer `Both` when backend and frontend must move together to be testable.

- **Order**
  - Integer `1..N`, defining recommended implementation sequence.
  - Earlier items should unblock or support later ones.

- **Priority**
  - `P0` – Critical path, blocks others, required for core acceptance of the story.
  - `P1` – Important but not blocking the core flow.
  - `P2` – Nice-to-have, polish, or optional enhancements.

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

## Estimation Rules

- Compute and display a **Total estimate** as the sum of all feature estimates.
- If `pre_estimate_hours` is present:
  - Try to keep total within ±20% of that value.
  - If that is not realistic, keep your own estimate and briefly explain why in **Notes**.
- If `pre_estimate_hours` is not present:
  - Provide your best realistic estimate and keep **Notes** minimal or empty.

## Handling Uncertainty and Assumptions

- Do **not** ask the user to confirm assumptions unless the story is fundamentally ambiguous.
- Instead:
  - Make reasonable, industry-standard assumptions.
  - List only the most important ones (max 5) under **Assumptions**.
  - Phrase them briefly and clearly in the same language as the User Story.

## Output Format (STRICT)

Always respond **only** with the formatted decomposition output below. Do **not** add extra commentary, explanations, or headings before or after it.

Use this exact structure and ordering:

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

2. Feature: <feature name>
   Description: <...>
   Scope: <...>
   Order: 2
   Priority: P0|P1|P2
   Estimate: <Yh>
   DoD:
   - <...>

<...more features as needed...>

Total estimate: <sum>h

Notes (optional, short):
- <only if needed: estimate mismatch rationale, risks, dependencies>

Assumptions (optional, max 5):
- <only if story missing critical details; keep short>

## Quality Bar

Ensure that:
- Feature names are short, action-oriented, and aligned with the User Story.
- Descriptions are understandable to both developers and QA without additional context.
- DoD items are concrete and testable; avoid vague phrases like "done when implemented".
- Splitting backend and frontend work into separate features is avoided when it makes QA harder; prefer a single feature with `Scope: Both` when that leads to a cleaner, testable increment.

