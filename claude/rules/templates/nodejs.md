# Node.js Rules

> Project-specific rules for Node.js / TypeScript. Copy to `.claude/rules/` or `.cursor/rules/` in your project.
> These rules extend the universal rules — they do not replace them.

## Conventions

- TypeScript strict mode enabled (`"strict": true` in tsconfig). Never use `any` except at third-party integration boundaries, and annotate those with `// eslint-disable-next-line` + a comment explaining why.
- Use ESM imports (`import`/`export`), not CommonJS (`require`/`module.exports`).
- Prefer `async`/`await` over raw `.then()` chains. Never use callback-based APIs when a Promise-based alternative exists.
- Runtime validation at API boundaries with `zod`, `joi`, or equivalent — TypeScript types do not exist at runtime.
- Environment config via `dotenv` or `@nestjs/config` — never hardcode secrets, ports, or URLs.
- Prefer named exports over default exports — they enable better refactoring, auto-imports, and grep-ability.
- Use `node:` prefix for built-in modules (`import fs from 'node:fs'`) to distinguish from npm packages.

## Patterns

- Custom error classes extending `Error` with a `statusCode` property. Centralized error handler middleware catches and formats all errors.
- Use dependency injection (constructor injection, `tsyringe`, `inversify`, or NestJS built-in) for services that have dependencies. Avoid importing singletons directly.
- Express/Fastify route handlers are thin: parse request, call service, send response. No business logic in handlers.
- Database access through a repository or data-access layer — never write raw SQL in route handlers or services.
- Use `Promise.all()` for independent async operations, `Promise.allSettled()` when partial failure is acceptable.

## Anti-patterns

- Nested callbacks or deeply chained `.then().then().catch()` — flatten with `async`/`await`.
- Untyped API responses — always define response interfaces/types, even for external API calls.
- Global mutable state (module-level `let` variables shared across requests) — use request-scoped context or DI.
- Swallowing errors with empty `catch` blocks — at minimum, log the error.
- Using `ts-ignore` or `as any` to silence type errors instead of fixing the underlying type issue.
