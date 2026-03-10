---
name: subagent-feature-implementation
description: Orchestrates feature implementation and bug fixing through specialized subagents. The chat itself acts as orchestrator — no manager subagent. Use when the user asks to implement or build a feature, fix a bug using subagents, or mentions subagents or orchestration.
---

# Subagent Feature Implementation

## Purpose

Use this skill when a development task should be executed through specialized subagents.

**The chat is the orchestrator.** There is no manager subagent — the chat reads this skill, selects a workflow, and invokes specialist agents directly via the Agent tool.

Do not delegate orchestration to any subagent.

---

## Agent roster

| Agent | `subagent_type` | Responsibility |
|---|---|---|
| `analyst` | `analyst` | Clarify requirements, detect risks, validate understanding |
| `planner` | `planner` | Break the task into ordered, executable steps |
| `architect` | `architect` | Design system structure, validate clean architecture |
| `implementer` | `implementer` | Write production-ready code |
| `reviewer` | `reviewer` | Review code for quality, correctness, architectural compliance |
| `tester` | `tester` | Run tests or trace behavior, group failures by root cause |
| `fixer` | `fixer` | Fix one root cause identified by tester or reviewer |

---

## Global rules

Apply these rules throughout every workflow:

1. Respect clean architecture boundaries.
2. Do not invent requirements.
3. Do not refactor unrelated code.
4. Warn about risky or breaking changes.
5. Prefer official docs when API behavior is unclear.
6. Stop on blockers — do not retry blindly.
7. **Fixer receives exactly one independent root cause per invocation.** If multiple root causes need fixing, dispatch one Fixer per root cause.
8. **Never include test-running commands or diagnostic investigation tasks in a Fixer prompt.** Pass the Tester's diagnosis and `location` directly.
9. **Loop limits are per root cause category**, not total Fixer invocations.
10. **In test repair workflows, Fixer must NOT modify production code** (any file outside the test project or test shared infrastructure) without an explicit user checkpoint. If the fix requires a production code change, Fixer must return `blocked` and describe what change is needed. The orchestrator then triggers a user checkpoint before proceeding.

---

## Parallel execution rules

When Tester returns multiple issues and all have `cascading: false` and disjoint `location` file paths:

1. Collect all RC `location` values
2. Check for file path overlap — extract the file part (before `:`) from each location
3. If any two RCs share the same file path → dispatch Fixers **sequentially**
4. If all file paths are disjoint AND all `cascading: false` → dispatch **ALL Fixers simultaneously** with `run_in_background: true`
5. Announce before dispatching: *"Launching N fixers in parallel for RC#1, RC#2, ..."*
6. Wait for ALL background Fixers to complete before routing to final Tester
7. Check each result for `blocked` status — trigger user checkpoint if any Fixer is blocked

When some issues have `cascading: true`:
- Fix cascading RCs sequentially first (run Tester between each)
- After all cascading RCs are resolved, dispatch remaining independent RCs in parallel

---

## Standard agent response contract

Instruct every invoked agent to return this JSON:

```json
{
  "status": "success | feedback | blocked",
  "summary": "Short description of result",
  "details": "Detailed explanation",
  "artifacts": [],
  "issues": [],
  "next_step_recommendation": "analyst | planner | architect | implementer | reviewer | tester | fixer | none"
}
```

If an agent reports findings, expect `issues` entries in this format:

```json
{
  "rc_id": "RC#1",
  "cascading": false,
  "severity": "Low | Medium | High | Critical",
  "priority": "Low | Medium | High",
  "problem": "Description of the issue",
  "location": "path/to/File.cs:42",
  "risk": "Why this is a problem",
  "expected_behavior": "Correct behavior",
  "suggested_fix": "Recommended direction"
}
```

---

## Definition of done

Treat the task as done only when all applicable items are satisfied:

- functionality implemented
- code reviewed
- tests executed or logically validated
- critical defects resolved
- architecture respected
- documentation updated if needed

---

## Workflow selection

Choose the lightest valid workflow.

### Hotfix (lightest)

Use when: root cause is **fully known**, fix touches **≤ 2 files**, no design questions.

```
fixer → tester
```

Do NOT use when: fix spans > 2 files, root cause uncertain, architectural impact possible.

### Test repair

Use when existing tests broke after recent changes. Start with Tester to diagnose first.

When all root causes are independent (`all_independent: true`, disjoint locations) — dispatch all Fixers in parallel, then run one final Tester:

```
tester → [fixer RC#1 ∥ fixer RC#2 ∥ ... ∥ fixer RC#N] → tester (final)
```

When some root causes have `cascading: true` — fix cascading ones sequentially first, then dispatch remaining in parallel:

```
tester → fixer RC#1 (cascading) → tester → [fixer RC#2 ∥ fixer RC#3] → tester (final)
```

When root cause is completely unclear upfront:

```
analyst → tester → [fixer RC#1 ∥ ... ∥ fixer RC#N] → tester (final)
```

> **Important:** If any Fixer returns `blocked` because the fix requires modifying production code — trigger a **user checkpoint** before continuing (see User checkpoints section).

### Simple bug fix

Use when root cause is known and the fix is localized.

```
implementer → reviewer → tester
```

### Standard feature

```
analyst → planner → architect → implementer → reviewer → tester
```

Skip `architect` only if the task is small and does not affect architecture.
Skip `analyst` only if requirements are unambiguous and scope is trivially clear.

### Complex feature

```
analyst → planner → architect → implementer → reviewer → tester → fixer → tester
```

---

## Loop limits

- `implementer ↔ reviewer`: maximum **3 retry attempts per issue**
- `fixer ↔ tester`: maximum **3 retry attempts per root cause category**

Fixing root cause B does not consume a retry for root cause A.

When the limit is reached for a given issue → trigger a **user checkpoint** (see below).

---

## User checkpoints — when to pause and ask

Pause the workflow and briefly describe the situation to the user before continuing in these cases:

| Situation | What to say |
|---|---|
| Tester finds a bug **unrelated** to the original task | "Tester found an unrelated issue: [1-sentence description]. Continue fixing it or skip?" |
| Any agent returns `blocked` | "Agent blocked: [reason]. How would you like to proceed?" |
| Reviewer finds a **Critical** severity issue | "Reviewer flagged a critical problem: [1-sentence description]. Fix it now or continue?" |
| A fix requires **breaking changes** | "This fix involves a breaking change: [what changes]. Confirm to proceed?" |
| **2nd failed fix attempt** for the same root cause | "Fix failed twice for: [root cause]. One retry left. Continue or stop?" |
| **Loop limit reached** (3 retries exhausted) | "Could not resolve [root cause] after 3 attempts. [Brief summary of what was tried]. What should we do?" |
| Fixer returns `feedback` after a fix attempt | "Fix attempt was unsuccessful: [reason]. Retry or escalate?" |
| **Fixer blocked: production code change needed in test repair** | "Root cause '[description]' requires changing [production file/method]. Options: (a) fix the production code — it's a real bug, (b) skip this test — it's outdated, (c) stop. What should we do?" |
| **Parallel Fixer blocked** | "One or more parallel fixers were blocked: [list of blocked RCs and reasons]. How would you like to proceed?" |

Keep checkpoint messages short — one paragraph maximum. Wait for the user's response before proceeding.

Do NOT pause for routine expected transitions (e.g., tester finds a known failure category, reviewer returns normal feedback to implementer).

---

## Routing rules

After each agent responds:

| Agent | Status | `issues[]` | Next action |
|---|---|---|---|
| Any | `blocked` | any | **User checkpoint** — stop and ask |
| Tester | `success` | empty | Workflow complete |
| Tester | `success` | non-empty, Medium+ severity | Route to Fixer per root cause |
| Tester | `success` | non-empty, Low only | Workflow complete — mention remarks to user |
| Tester | `feedback` | non-empty | Route to Fixer per root cause |
| Tester | any | all `cascading: false`, disjoint locations | Dispatch ALL Fixers simultaneously with `run_in_background: true` |
| Tester | any | some `cascading: true` | Fix cascading RCs sequentially; dispatch remaining in parallel after |
| Fixer | `success` | empty | In **test repair** (independent RCs, parallel dispatch): wait for all, then route to final Tester. In other workflows: route to Tester |
| Fixer | `success` | non-empty | Route to Tester, then handle remaining issues |
| Fixer | `blocked` (production code needed in test repair) | any | **User checkpoint** — stop and ask |
| Fixer | `feedback` | any | Increment retry counter for this root cause. If count = 2 → **user checkpoint**. Otherwise retry |
| Reviewer | `success` | Critical issues | **User checkpoint** — ask before continuing |
| Reviewer | `success` | no Critical issues | Route to Tester |
| Reviewer | `feedback` | any | Route to Implementer |
| Implementer | `feedback` | any | Retry (increment counter) |

---

## How to orchestrate (chat behavior)

When this skill is triggered:

1. **Select the workflow** based on the task type.
2. **Collect context** before the first agent call:
   - Project root path
   - Relevant file paths (recently modified files, test project path, error output if known)
2.5. **Explore pre-phase (lightweight, orchestrator-only):** When the project root is unfamiliar or no relevant file paths have been provided, run 2–3 Glob/Grep/Read calls yourself before invoking the first agent. Maximum 3 tool calls. Skip when the user has provided sufficient context.
3. **Invoke the first specialist** via the Agent tool with a focused prompt.
4. **After each response**: check status, apply routing rules, check for user checkpoint conditions.
5. **Announce each step** briefly to the user: *"Running Tester..."*, *"Fixer applied fix for root cause #1, verifying..."*
6. **On workflow completion**: report a short summary — what was done, which files changed, DoD status.

### What to include in every specialist prompt

- Task description (original user request)
- Project root: `/path/to/project`
- Relevant paths: specific files or directories
- Known errors or symptoms (if any)
- The specific instruction for this agent's role
- Required JSON response format

### What to include in Fixer prompts specifically

- The exact `issues[i]` object from the Tester's response (rc_id, problem, location, suggested_fix)
- Do NOT include test commands
- Do NOT ask Fixer to investigate or diagnose
- **In test repair workflows**: explicitly state the fix scope — e.g. `"Fix scope: test files and test infrastructure only. If the root cause requires modifying production code (controllers, services, repositories outside the test project), do NOT apply the fix — return status: blocked and describe what production change is needed."`

---

## When not to use this skill

Do not use this skill for:

- Tiny single-file edits that do not benefit from delegation
- One-off code questions
- Isolated review-only requests
- Isolated architecture-only requests

**Exception: if triggered by `/implement` command, these exceptions do NOT apply.**

---

## Examples

### Trigger examples

- `Implement this feature using subagents`
- `Build this feature end to end`
- `Fix this bug using subagents`
- `Tests are failing after my changes, fix them`

### Routing examples

- `Tests broke after recent changes` → **test repair** workflow
- `Fix a localized bug, root cause is known` → **simple bug fix** workflow
- `Root cause fully known, touches 1 file` → **hotfix** workflow
- `Add a new API feature with cross-layer impact` → **standard or complex feature** workflow
- `Only architecture design needed` → call `architect` directly, skip this skill
