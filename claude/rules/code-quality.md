# Code Quality Rules

> Universal code quality rules. Copy to `.claude/rules/code-quality.md` in your project.
> Override or extend with project-specific conventions (e.g., PHP strict_types, C# nullable, etc.)

## General Principles

- Follow existing project conventions — do not invent new patterns when the codebase already has established ones.
- Keep changes minimal and focused. Touch only what is necessary for the task.
- Do not refactor unrelated code unless explicitly requested.
- Prefer readability over cleverness. Code is read far more often than written.

## Before Writing Code

- Search for existing utilities, helpers, and patterns before creating new ones.
- Understand the existing architecture: layers, boundaries, naming conventions.
- Identify which layers are affected (UI / API / Domain / Infrastructure / DB).
- Follow dependency injection patterns already in use.

## Code Structure

- Keep functions small, focused, and cohesive — one responsibility per function.
- Avoid magic numbers and unexplained constants.
- Add comments only where the logic is non-obvious. Do not add noise comments.
- No dead code, no commented-out code, no unused imports.
- Consistent naming: follow the project's existing naming conventions.

## Safety

- Do not introduce breaking changes without warning the user.
- Preserve backward compatibility unless explicitly told otherwise.
- Highlight risky changes and mention possible side effects.
- Validate inputs at system boundaries (user input, external APIs). Trust internal code.

## What NOT to Do

- Do not overengineer — no speculative abstractions for hypothetical future needs.
- Do not add error handling for scenarios that cannot happen.
- Do not create helpers or utilities for one-time operations.
- Do not add docstrings, comments, or type annotations to code you did not change.
- Do not add feature flags or backwards-compatibility shims when you can just change the code.
