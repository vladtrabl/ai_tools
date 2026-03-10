---
name: mr-review
description: Analyzes Merge Request diffs for .NET projects and produces a structured senior-architect review (Clean Architecture, quality, risks). Use when the user asks to review an MR/PR, merge request, pull request, or uses Ukrainian phrases such as "проведи МР ревʼю", "проведи ревʼю мердж ріквесту", "ревʼю МР", "ревʼю з гілки X в Y", "review merge request", "review this PR", or specifies branches for comparison (e.g. "з гілки feature в main").
---

# MR Review (Merge Request Review)

Conduct a code review of a merge request diff as a senior .NET architect. Produce a structured Markdown report suitable for pasting into GitLab/GitHub MR discussion.

## When to use

- **"Проведи МР ревʼю"** / **"Проведи ревʼю мердж ріквесту"** — review the MR in the **current branch** (compare current branch to its merge base with main or develop).
- **"Проведи ревʼю МР з гілки &lt;branch-from&gt; в &lt;branch-to&gt;"** — review the diff from `branch-from` into `branch-to`.
- Equivalent English: "Review this MR", "Review merge request", "Review PR from branch X to Y".

### Example prompts (Ukrainian)

- Проведи МР ревʼю
- Проведи ревʼю мердж ріквесту
- Проведи ревʼю МР з гілки feature/auth в develop
- Зроби ревʼю пул реквесту в поточній гілці

### Example prompts (English)

- Review this merge request
- Conduct MR review for the current branch
- Review MR from feature/auth into main

## Step 1 — Get the diff

1. **Current-branch review**: From repo root run:
   - `git merge-base HEAD main` or `git merge-base HEAD develop` (use the default target your team uses). Then:
   - `git diff <merge-base>..HEAD` to get the unified diff.
   - If no `main`/`develop`, use `git diff main..HEAD` or `git diff develop..HEAD` as appropriate.
2. **Explicit branches**: If the user specified "з гілки **A** в **B**" (from A to B), run:
   - `git diff A..B` (or `B..A` depending on direction: diff should show what would be merged into the target). Typically: `git diff <target-branch>..<source-branch>` so the diff is what the MR adds.

Capture the full unified diff (and optionally the merge-base or branch names) for context.

## Step 2 — Optional context

If available, gather and use:
- **mr_description**: MR/PR description or acceptance criteria (from issue, clipboard, or "paste it here").
- **context**: Architecture notes (Clean Architecture, module boundaries, EF usage, logging, transactions, security).
- **constraints**: Team rules (naming, patterns to follow/avoid, forbidden dependencies).

If something is missing, proceed with the diff only and state assumptions in the report.

## Step 3 — Run the review

Apply the following review process to the diff (and any optional inputs). Do **not** rewrite the feature or invent code that is not in the diff. Be direct and professional; if unsure, mark it as **Assumption** and suggest what to check.

### Review focus (check all)

- **Clean Architecture**: Domain/app/infrastructure/UI boundaries; dependency direction; forbidden references.
- **Breaking changes**: Public API, contracts, DB schema, events.
- **Nullability**: NRT, default/null flows, guard clauses.
- **Async/await**: Correct usage; no sync-over-async; no deadlocks; no inappropriate fire-and-forget (ConfigureAwait only if library code).
- **CancellationToken**: Propagation, honoring, default tokens in IO calls.
- **Exception handling**: Swallowing, rethrowing, error mapping; avoid converting all exceptions to 200 OK.
- **Logging**: Structured logs, PII leakage, log levels, correlation.
- **Performance**: LINQ allocations, EF Core tracking, N+1, pagination, indexes.
- **Security**: AuthZ/authN, input validation, injection, secrets, PII.
- **Transactions**: EF transactions, outbox/inbox, idempotency.
- **Concurrency**: Race conditions, locks, optimistic concurrency, retries.

### High-risk triggers (flag as High if present)

- Domain depends on Infrastructure/UI.
- Breaking contract changes without versioning.
- Missing CancellationToken in IO calls.
- EF Core N+1 or unbounded queries.
- Logging sensitive data.
- Transaction + event publishing without outbox/retries.
- Swallowing exceptions or mapping all to 200 OK.

### Output format (MANDATORY)

Return **only** the following Markdown. No preamble or extra commentary.

```markdown
## 1) Summary of changes
(Max 10 lines.)

## 2) Architectural risks
- Bullets; include file references where possible.

## 3) Code quality issues
- Bullets; severity tags [Critical] / [Major] / [Minor]. Quote short fragments (≤5 lines) when helpful; use file paths and line numbers if present.

## 4) Performance risks
- Bullets; include why and likely impact.

## 5) Suggested improvements
- Actionable checklist; prefer small, concrete diffs.

## 6) What tests are missing
- Unit/integration/e2e suggestions; edge cases.

## 7) Risk level
**Level:** Low | Medium | High
(2–3 sentences justification.)
```

### Referencing

- When pointing to problems, quote short code fragments (≤5 lines) from the diff.
- Use file paths and line numbers when present; otherwise file path + nearest snippet.
- Avoid long code dumps.

### Edge cases

- **Very large diff**: Prioritize by risk; in each relevant section call out "Top 5 issues" first.
- **Missing context** (e.g. domain boundaries not visible): Still assess what you can and list assumptions clearly.

### Tone

Senior reviewer: concise, precise, pragmatic. Propose changes aligned with Clean Architecture and .NET best practices.

---

## Deliverable

Provide **only** the final Markdown review (sections 1–7). No extra commentary before or after.
