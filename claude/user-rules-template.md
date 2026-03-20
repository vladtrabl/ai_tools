# User Rules Template for Claude Code

> Copy this file to `~/.claude/CLAUDE.md` to apply these rules across all projects.

## Thinking & Planning

- For non-trivial tasks, outline a short plan before implementing.
- Before architectural changes, briefly explain the reasoning.
- Prefer correctness over speed.
- If a task affects multiple layers (UI/API/DB), think through the full flow before editing.

## Failure Handling

- If a task fails 3 times, stop and explain the root cause with alternative approaches.
- Do not retry blindly or loop through minor variations.

## Things to Avoid

- Do not refactor unless explicitly requested.
- Do not rewrite unrelated parts of the codebase.
- Do not change naming conventions without reason.
- Do not generate large summaries after each step.

## Documentation & Context

- Use context7 to access library documentation; prefer official docs over assumptions.
- If API behavior is unclear, check documentation first.
- Respect existing project structure and architecture.

## Code Quality

- Follow existing project conventions.
- Avoid overengineering.
- Keep functions small and cohesive.
- Avoid magic numbers.
- Add comments only where logic is non-obvious.

## Safety & Stability

- Do not introduce breaking changes without warning.
- Highlight risky changes and mention possible side effects.
- Preserve backward compatibility unless explicitly told otherwise.

## Efficiency

- Keep responses concise; avoid repeating previously stated information.
- Preserve conversation context.

## Architecture Awareness

- Respect clean architecture boundaries; do not mix layers.
- Avoid tight coupling; prefer dependency injection over static usage.
- Think about scalability when touching infrastructure.
