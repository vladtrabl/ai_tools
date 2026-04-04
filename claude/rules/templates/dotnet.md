# .NET Rules

> Project-specific rules for .NET / C#. Copy to `.claude/rules/` or `.cursor/rules/` in your project.
> These rules extend the universal rules — they do not replace them.

## Conventions

- Enable nullable reference types (`<Nullable>enable</Nullable>`) and treat warnings as errors (`<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`).
- Prefer `record` types for DTOs and value objects — use classes only when mutability is required.
- Async all the way: never call `.Result`, `.Wait()`, or `GetAwaiter().GetResult()`. Propagate `CancellationToken` through every async call chain.
- Use `IAsyncEnumerable<T>` for streaming scenarios instead of buffering entire collections.
- Register dependencies via interfaces in DI container. One registration per service; avoid composite roots or manual resolution.
- Use `FluentValidation` or `DataAnnotations` for input validation — validate at the API boundary, not inside domain logic.
- Structured logging via `ILogger<T>` (Microsoft.Extensions.Logging or Serilog). Use log message templates with named placeholders, not string interpolation.

## Patterns

- EF Core reads: always use `AsNoTracking()` for read-only queries. Prefer projections (`.Select()`) over loading full entities.
- EF Core writes: load entities via tracked queries, mutate, then `SaveChangesAsync()`. Do not attach detached entities unless you understand the change tracker state.
- Controllers are thin: receive request, call service/mediator, return result. No business logic, no direct repository access.
- Use `Result<T>` or similar discriminated return types instead of throwing exceptions for expected business failures.
- Map between layers explicitly — use AutoMapper profiles or manual mapping methods, never expose EF entities in API responses.

## Anti-patterns

- Static helper classes that hold dependencies or state — use injected services instead.
- God controllers with 10+ actions or 200+ lines — split by feature or resource.
- Business logic in controllers, middleware, or action filters — it belongs in domain/application services.
- Catching `Exception` broadly without rethrowing or logging — handle specific exception types.
- Synchronous database calls in async endpoints — always await EF Core operations.
