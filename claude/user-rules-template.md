# User Rules Template for Claude Code

> Copy this file to `~/.claude/CLAUDE.md` to apply these rules across all projects.
> For project-specific rules, copy individual files from `claude/rules/` to `.claude/rules/` in your project.

## Available Rules (auto-loaded from `.claude/rules/`)

| File | Purpose |
|---|---|
| `rules/workflow.md` | Planning, agent dispatch, loop limits, user checkpoints |
| `rules/code-quality.md` | Code conventions, safety, what NOT to do |
| `rules/git-operations.md` | Commit, PR, branch safety rules |
| `rules/testing.md` | Test principles, structure, when tests fail |
| `rules/architecture.md` | Layer boundaries, dependencies, data flow |

## Setup Instructions

### Option A: User-level (all projects)

```bash
# Copy agents
cp claude/agents/*.md ~/.claude/agents/

# Copy skills
cp -r claude/skills/* ~/.claude/skills/

# Copy rules (these auto-load when present)
mkdir -p ~/.claude/rules
cp claude/rules/*.md ~/.claude/rules/

# Copy this file as user-level CLAUDE.md
cp claude/user-rules-template.md ~/.claude/CLAUDE.md
```

### Option B: Project-level (single project)

```bash
# Copy agents
cp claude/agents/*.md .claude/agents/

# Copy skills
cp -r claude/skills/* .claude/skills/

# Copy rules
mkdir -p .claude/rules
cp claude/rules/*.md .claude/rules/

# Copy as project-level CLAUDE.md
cp claude/user-rules-template.md CLAUDE.md
```

### Option C: Cherry-pick

Copy only the rules and agents you need. Each file is self-contained.

## Core Principles

- **Simplicity First** — Make every change as simple as possible. Impact minimal code.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Changes should only touch what is necessary.

## Agent System

This project provides 7 specialized agents with TOON output format:

| Agent | Model | Role | Restrictions |
|---|---|---|---|
| analyst | opus | Requirements, risks, edge cases | Read-only |
| architect | opus | System design, diagrams | Read-only |
| planner | opus | Task decomposition | Read-only, no Bash |
| reviewer | opus | Code review | Read-only |
| tester | haiku | Test execution, validation | Read-only |
| implementer | sonnet | Code implementation | Full access |
| fixer | sonnet | Targeted bug fixes | Full access |

## Agent Response Format (TOON)

All agents return responses in TOON (Token-Oriented Object Notation) — a compact, token-efficient format:

```
status: success | feedback | blocked
summary: Short description
details: Detailed explanation
artifacts[0]:
issues[0]:
next_step_recommendation: none
```

Issues use pipe-delimited tabular format:

```
issues[N|]{severity|priority|problem|location|risk|expected_behavior|suggested_fix}:
  High|High|Description|path/to/File.cs:42|Risk|Expected|Fix direction
```

## Customization

Override rules per project by creating `.claude/rules/<name>.md` in the project root. Project-level rules take precedence over user-level rules with the same name.

Add project-specific rules for:
- Language/framework conventions (PHP strict_types, C# nullable, Python type hints)
- Docker/container commands
- CI/CD pipeline steps
- MCP server integration
- Domain-specific patterns
