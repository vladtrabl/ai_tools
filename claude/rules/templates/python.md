# Python Rules

> Project-specific rules for Python. Copy to `.claude/rules/` or `.cursor/rules/` in your project.
> These rules extend the universal rules — they do not replace them.

## Conventions

- Type hints on all function signatures and return types (PEP 484). Use `from __future__ import annotations` for modern syntax in older Python versions.
- Use `dataclasses` for plain data containers and `pydantic.BaseModel` for validated/serialized data (API input/output, config).
- Virtual environment is mandatory — `venv`, `poetry`, or `uv`. Never install packages globally.
- Use `pathlib.Path` for all file system operations instead of `os.path` string manipulation.
- f-strings for string formatting. Do not use `.format()`, `%` formatting, or string concatenation for building messages.
- Use the `logging` module with named loggers (`logging.getLogger(__name__)`) — never use `print()` for production output.
- Use context managers (`with` statement) for all resource management: files, database connections, locks.

## Patterns

- Prefer list/dict/set comprehensions over `map()`/`filter()` for simple transformations. Use generator expressions for large sequences.
- Use `Enum` for fixed sets of values instead of string constants or magic numbers.
- FastAPI/Flask route handlers are thin: validate input, call service, return response. Business logic lives in service modules.
- Use `@dataclass(frozen=True)` or `pydantic` immutable models for value objects that should not change after creation.
- Prefer `isinstance()` checks over `type()` comparisons. Use `Protocol` for structural subtyping when duck typing is intentional.

## Anti-patterns

- Bare `except:` or `except Exception:` without re-raising — always catch specific exception types or at minimum log and re-raise.
- Mutable default arguments (`def f(items=[])`) — use `None` and assign inside the function body.
- Wildcard imports (`from module import *`) — always import specific names.
- Using `os.system()` or `subprocess` with `shell=True` for commands — use `subprocess.run()` with argument lists.
- Mixing `async` and sync code without proper boundaries — use `asyncio.to_thread()` for blocking calls inside async functions.
