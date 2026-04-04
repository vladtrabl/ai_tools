# AI Tools

Reusable agent definitions, skills, and rules for Claude Code and Cursor AI-assisted development.

## What is this?

A template library of markdown-based configurations that define specialized agents, orchestration workflows, and coding rules for AI-assisted development. There is no executable code — all files are markdown prompts consumed by Claude Code and Cursor. Designed to be copied to user-level (`~/.claude/`, `~/.cursor/`) or project-level (`.claude/`, `.cursor/`) config directories.

## Features

- 7 specialized agents (analyst, architect, planner, reviewer, tester, implementer, fixer) + a manager orchestrator for Cursor
- 3 orchestration skills (feature implementation, MR review, user story decomposition) + merge-request-helper for Cursor
- 5 universal rules (workflow, code quality, git operations, testing, architecture)
- 4 stack-specific rule templates (.NET, Laravel, Node.js, Python)
- TOON output format for token-efficient agent responses
- 6 safety and productivity hooks (git guard, destructive command guard, audit log, commit validation, file write guard, context reinjection)
- Interactive CLI installer for quick setup

## Quick Start

### Option A: CLI Installer (recommended)

```bash
git clone <repo-url>
cd ai-tools
npm install
npm run setup
```

The interactive menu lets you choose the target tool (Claude or Cursor), installation level (user or project), and which components to install.

### Option B: Manual Copy

**Claude Code — user-level (all projects):**

```bash
cp claude/agents/*.md ~/.claude/agents/
cp -r claude/skills/* ~/.claude/skills/
mkdir -p ~/.claude/rules
cp claude/rules/*.md ~/.claude/rules/
```

**Cursor — user-level (all projects):**

```bash
cp cursor/agents/*.md ~/.cursor/agents/
cp -r cursor/skills/* ~/.cursor/skills/
mkdir -p ~/.cursor/rules
cp cursor/rules/*.md ~/.cursor/rules/
```

For project-level installation, replace `~/.<tool>/` with `.<tool>/` in your project root.

## Repository Structure

```
claude/
  agents/              # 7 specialist agents
  commands/            # implement.md (thin dispatcher)
  hooks/               # 6 hook scripts + settings template
  rules/               # 5 universal rules
    templates/         # Stack-specific: dotnet, laravel, nodejs, python
  skills/              # mr-review, subagent-feature-implementation, userstory-to-features
  user-rules-template.md

cursor/
  agents/              # 8 agents (7 + manager orchestrator)
  commands/            # implement.md (thin dispatcher)
  rules/               # 5 universal rules (adapted for Cursor)
  skills/              # mr-review, subagent-feature-implementation, userstory-to-features, merge-request-helper

scripts/
  setup.mjs            # CLI installer
```

## Agents

| Agent | Model | Role | Restrictions |
|---|---|---|---|
| analyst | opus | Requirements, risks, edge cases | Read-only |
| architect | opus | System design, diagrams | Read-only |
| planner | opus | Task decomposition | Read-only, no Bash |
| reviewer | opus | Code review | Read-only |
| tester | haiku | Test execution, validation | Read-only |
| implementer | sonnet | Code implementation | Full access |
| fixer | sonnet | Targeted bug fixes | Full access |

Model assignments apply to Claude Code. In Cursor, all agents use `model: inherit` to follow the editor's model selection.

## Orchestration Workflows

Workflows are selected by task complexity and invoked via `/implement`:

- **Hotfix** (root cause known): `fixer -> tester`
- **Test repair**: `tester -> [fixer RC#1 | fixer RC#2 | ...] -> tester`
- **Simple bug fix**: `implementer -> reviewer -> tester`
- **Standard feature**: `analyst -> planner -> architect -> implementer -> reviewer -> tester`
- **Complex feature**: standard pipeline + `fixer -> tester`

Key constraints: one root cause per fixer invocation, max 3 retry loops per issue, pause for user input when blocked or on critical findings.

## Skills

**subagent-feature-implementation** — Orchestrates the full development workflow by dispatching specialized agents in sequence. Triggered via `/implement`.

**mr-review** — Performs a structured senior-architect review of MR/PR diffs. Produces a 7-section report covering architecture, code quality, security, and risks. Language-agnostic with optional framework-specific checks.

**userstory-to-features** — Decomposes a user story into 3-7 implementable features with definition of done, priority, and effort estimates. Supports three depth tiers (shallow, standard, deep). Works in English and Ukrainian.

**merge-request-helper** (Cursor only) — Alternative MR review style tailored to Cursor's agent model.

## Rules

**Universal rules** (5 files) — apply to any project regardless of stack:

| File | Purpose |
|---|---|
| `workflow.md` | Planning, agent dispatch, loop limits, user checkpoints |
| `code-quality.md` | Code conventions, safety, what not to do |
| `git-operations.md` | Commit, PR, branch safety rules |
| `testing.md` | Test principles, structure, when tests fail |
| `architecture.md` | Layer boundaries, dependencies, data flow |

**Stack templates** (4 files in `claude/rules/templates/`) — copy the one matching your stack into your rules directory:

- `dotnet.md` — .NET / C# conventions
- `laravel.md` — Laravel / PHP conventions
- `nodejs.md` — Node.js / TypeScript conventions
- `python.md` — Python conventions

## Hooks (Claude Code only)

Optional hooks that integrate into Claude Code's event system. Install via the CLI installer (select "Hooks" component).

| Hook | Event | Purpose |
|---|---|---|
| `git-safety.sh` | PreToolUse (Bash) | Blocks force push, reset --hard, checkout ., clean -f |
| `destructive-guard.sh` | PreToolUse (Bash) | Blocks rm -rf, DROP TABLE, docker system prune |
| `commit-msg-check.sh` | PreToolUse (Bash) | Validates commit message format (imperative mood, length) |
| `file-write-guard.sh` | PreToolUse (Write/Edit) | Blocks writes to .env, credentials, key files |
| `agent-audit.sh` | SubagentStop | Logs agent executions to `~/.claude/logs/agent-audit.jsonl` |
| `compact-reinject.sh` | SessionStart (compact) | Reinjects TOON format and pipeline rules after context compaction |

Hooks are installed per-selection — only chosen hooks are added to `settings.json`.

## Customization

Override any rule per project by creating a file with the same name in `.claude/rules/` or `.cursor/rules/` inside your project root. Project-level rules take precedence over user-level rules.

Add project-specific rules for language conventions, Docker commands, CI/CD pipelines, MCP server integration, or domain-specific patterns.

## Claude vs Cursor

| Aspect | Claude Code | Cursor |
|---|---|---|
| Orchestrator | Chat itself acts as orchestrator | Dedicated `manager` agent orchestrates |
| Delegation | Uses the Agent tool to spawn subagents | Uses the Task tool to delegate to agents |
| Model assignment | Per-agent (opus, sonnet, haiku) | `model: inherit` (follows editor setting) |
| Extra agents | -- | `manager` orchestrator |
| Extra skills | -- | `merge-request-helper` |

## License

See [LICENSE](LICENSE) for details.
