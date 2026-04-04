# Architecture Rules

> Universal architecture rules. Copy to `.claude/rules/architecture.md` in your project.
> Override with project-specific patterns (Clean Architecture, DDD, CQRS, etc.)

## General Principles

- Respect existing architecture boundaries — do not mix layers.
- Understand the project's architecture before proposing changes.
- Search for existing patterns before introducing new ones.
- Changes should be consistent with the surrounding codebase.

## Layer Boundaries

- Domain/business logic must not depend on infrastructure or UI.
- Infrastructure concerns (databases, external APIs, file systems) belong in the infrastructure layer.
- UI/presentation concerns must not contain business logic.
- Dependencies point inward: UI -> Application -> Domain <- Infrastructure.

## Dependency Management

- Prefer dependency injection over static usage or service locators.
- Avoid tight coupling between components.
- Do not introduce circular dependencies.
- New dependencies (packages, libraries) require justification.

## Data Flow

- Keep data transformations explicit and traceable.
- Prefer immutable data structures where practical.
- Validate data at system boundaries, trust internal data.
- Use DTOs or value objects for cross-layer data transfer when the project already does so.

## When to Escalate

- Propose architecture changes only when explicitly justified by the task.
- Do not restructure existing code that is not part of the current task.
- Flag architectural concerns as issues rather than silently restructuring.
- For significant architectural decisions, use plan mode and get user approval first.
