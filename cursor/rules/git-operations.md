# Git Operations Rules

> Universal git rules. Copy to `.cursor/rules/git-operations.md` in your project.

## Commit Rules

- NEVER create commits automatically — only commit when explicitly requested by the user.
- NEVER push to remote without explicit user request.
- NEVER force push or run destructive git commands without explicit approval.
- NEVER amend published commits without explicit approval.
- NEVER skip hooks (--no-verify) unless the user explicitly asks for it.
- When changes are ready, inform the user and wait for their instruction.

## Commit Messages

- Summarize the "why", not the "what" — the diff shows what changed.
- Keep the first line under 72 characters.
- Use imperative mood: "Add feature" not "Added feature".
- Follow the project's existing commit message conventions.

## Pull Request Descriptions

- NEVER mention AI tools (Claude, Copilot, Gemini, etc.) in PR title or body.
- NEVER include change statistics (file count, lines added/removed).
- Keep PR descriptions focused on what changed and why.
- Include a test plan or verification steps.

## Branch Safety

- Before destructive operations, consider safer alternatives.
- Investigate unexpected state (unfamiliar files, branches) before deleting or overwriting.
- Resolve merge conflicts rather than discarding changes.
- If a lock file exists, investigate what process holds it rather than deleting it.
