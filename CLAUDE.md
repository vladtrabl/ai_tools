# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a prompt engineering and agent orchestration framework — a template library of markdown-based configurations for AI-assisted development workflows in two tools: **Claude** and **Cursor**. There is no executable code; all "execution" happens when these instructions are fed to AI systems.

## Repository Structure

```
claude/          # Claude-specific configurations
  agents/        # 7 specialist agent definitions (analyst, architect, fixer, implementer, planner, reviewer, tester)
  commands/      # Orchestration routing rules (implement.md)
  skills/        # 3 skills (mr-review, subagent-feature-implementation, userstory-to-features)

cursor/          # Cursor-specific configurations
  agents/        # 8 agents (same 7 + manager orchestrator)
  commands/      # implement.md
  skills/        # 4 skills (same 3 + merge-request-helper)
```

## Architecture

### Agent Roles

| Agent | Responsibility |
|-------|---------------|
| **analyst** | Clarify requirements, detect risks, validate architectural implications before coding |
| **planner** | Decompose tasks into ordered, executable steps; identify parallelization opportunities |
| **architect** | Design system structure, C4 diagrams, enforce Clean Architecture constraints |
| **implementer** | Write production-ready code following existing patterns |
| **reviewer** | Evaluate correctness, maintainability, architecture consistency, security, performance |
| **tester** | Run/trace tests, group failures by root cause, determine independence and cascading |
| **fixer** | Fix ONE root cause per invocation with minimal, correct changes |
| **manager** *(Cursor only)* | Orchestrates the full lifecycle by delegating to specialists |

### Orchestration Workflows (implement command)

Workflows are selected by task complexity:

- **Hotfix** (root cause known): `fixer → tester`
- **Test repair**: `tester → [fixer RC#1 ∥ fixer RC#2 ...] → tester`
- **Simple bug fix**: `implementer → reviewer → tester`
- **Standard feature**: `analyst → planner → architect → implementer → reviewer → tester`
- **Complex feature**: same as standard, with `fixer → tester` appended

Key rules:
- One root cause per Fixer invocation; dispatch N fixers in parallel for N independent root causes
- Read-only steps (analyst, architect) can run in parallel
- Max 3 retry loops per issue (implementer ↔ reviewer, fixer ↔ tester)
- Pause for user input when blocked, loop limit reached, or critical issues found

### Claude vs. Cursor Difference

**Claude**: The chat itself acts as orchestrator; uses `subagent-feature-implementation` skill.
**Cursor**: A dedicated `manager` agent orchestrates; delegation is more explicit and structured.

### Standard Agent Response Contract

Every agent returns this JSON structure:
```json
{
  "status": "success | feedback | blocked",
  "summary": "...",
  "details": "...",
  "artifacts": [],
  "issues": [],
  "next_step_recommendation": "agent_name | none"
}
```

Tester adds `rc_id` (RC#1, RC#2, ...) and `cascading` fields to issues for root cause tracking.

### Clean Architecture Constraints (embedded in all workflows)

- Domain layer has zero outward dependencies
- Infrastructure/UI depends inward; never the reverse
- Violations are treated as architectural risks in reviews

## Key Skills

- **mr-review** — Senior architect review of MR diffs; outputs a 7-section structured report
- **userstory-to-features** — Decomposes user stories into 3–7 implementable features with DoD, priority, estimates; supports Ukrainian and English
- **subagent-feature-implementation** — Orchestration skill for Claude; routes to the appropriate workflow
- **merge-request-helper** *(Cursor only)* — Alternative MR review style
