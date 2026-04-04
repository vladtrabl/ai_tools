# Laravel Rules

> Project-specific rules for Laravel / PHP. Copy to `.claude/rules/` or `.cursor/rules/` in your project.
> These rules extend the universal rules — they do not replace them.

## Conventions

- `declare(strict_types=1);` at the top of every PHP file, no exceptions.
- Use Form Requests for all input validation — never validate inside controllers or services.
- Config values via `.env` and `config()` helper — never hardcode credentials, URLs, or environment-specific values.
- Use Route Model Binding for resource routes instead of manual `find()` / `findOrFail()` calls.
- Authorize with Policies for resource-based checks and Gates for simple boolean permissions. Never check roles/permissions inline in controllers.
- Always create database migrations for schema changes — never modify the database manually or via raw SQL migrations.
- Return consistent API responses: use API Resources (JsonResource) for transformations, not raw arrays or `toArray()`.

## Patterns

- Eloquent: define query scopes for reusable filtering logic. Avoid raw SQL unless there is a measured performance need.
- Use Laravel's built-in features first (Events, Jobs, Notifications, Mail) before reaching for third-party packages.
- Queue long-running operations (email, PDF generation, API calls) via Jobs — never block HTTP requests.
- Use Service classes for business logic that spans multiple models or requires orchestration. Keep models focused on relationships, scopes, and accessors.
- Prefer `$model->relationship()->create()` over manually setting foreign keys and saving.

## Anti-patterns

- Fat controllers with validation, authorization, business logic, and response formatting all in one method.
- Eloquent queries or `DB::` facade calls directly in controllers — use repositories or service classes.
- Using `Model::all()` without pagination or limits on collections that can grow.
- Skipping mass assignment protection — always define `$fillable` or `$guarded` on models.
- Returning Eloquent models directly from API endpoints — always use API Resources to control the response shape.
