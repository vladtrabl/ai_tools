# Testing Rules

> Universal testing rules. Copy to `.claude/rules/testing.md` in your project.
> Override with project-specific test frameworks, commands, and conventions.

## General Principles

- Never mark a task complete without running or logically validating tests.
- Run the real test suite when available — do not substitute logical analysis for actual execution.
- Group failures by independent root cause, not by individual test name.
- One root cause per fix attempt. Do not silently fix multiple unrelated issues.

## What to Test

- Business logic and domain rules.
- API endpoints and HTTP responses (status codes, response structure).
- Validation rules and error handling.
- Edge cases and boundary conditions.
- Authentication and authorization flows.
- Integration points with external systems.

## What NOT to Test

- Framework internals (ORM CRUD, basic routing, built-in middleware).
- Trivial getters/setters without logic.
- Third-party library functionality.
- Constructor-only classes without behavior.

## Test Structure

- Follow the AAA pattern: Arrange, Act, Assert.
- One behavior per test — tests should be independent and focused.
- Use factories/builders for test data — avoid manual object construction.
- Prefer real implementations over mocks when possible (integration tests).
- Mock only external dependencies (HTTP clients, payment gateways, email).

## Test Naming

- Test names should describe the behavior, not the method.
- Good: "returns error when email is invalid"
- Bad: "testValidateEmail"

## When Tests Fail

- Diagnose the root cause before fixing.
- Determine if it is a test issue or a code issue.
- Check logs and error messages for context.
- Do not blindly adjust assertions to make tests pass.
