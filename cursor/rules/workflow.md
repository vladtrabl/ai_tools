# Workflow Orchestration Rules

> Universal workflow rules for agent-based development. Copy to `.cursor/rules/workflow.md` in your project.

## Planning

- Enter plan mode for ANY task with 3+ steps or architectural decisions.
- If something goes wrong, STOP and re-plan — do not keep pushing a failing approach.
- Write a brief plan before implementation. Verify it makes sense before starting.
- Never mark a task complete without proving it works.

## Agent Dispatch

- Follow the agent pipeline defined in your project's skill or command configuration.
- Cursor has a dedicated `manager` agent that orchestrates the full lifecycle by delegating to specialist agents. Use it for structured multi-step workflows.
- Use the Task tool to delegate work to specialist agents.
- Autonomously select which agents should handle each part of a task — do not ask the user which agent to use.
- Run independent pipeline steps in parallel where possible (e.g., analyst + architect can run simultaneously).
- For every non-trivial task: analyze -> select agents -> dispatch (parallel where possible) -> collect results -> verify.

## Subagent Strategy

- Use subagents to keep the main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- One task per subagent for focused execution.
- For complex problems, dispatch multiple subagents rather than doing everything sequentially.

## Loop Limits

- `implementer <-> reviewer`: maximum 3 retry attempts per issue.
- `fixer <-> tester`: maximum 3 retry attempts per root cause.
- After 3 failed attempts, stop and report the blocker to the user.
- Do not retry blindly — diagnose the root cause before each retry.

## Verification Before Done

- Never mark a task complete without proving it works.
- Run tests, check build, demonstrate correctness.
- Ask yourself: "Would a senior engineer approve this?"
- Diff behavior between the original state and your changes when relevant.

## User Checkpoints — When to Pause

Pause and ask the user before proceeding in these situations:

- Any agent returns `blocked`
- A fix requires breaking changes
- Reviewer finds a Critical severity issue
- 2nd failed fix attempt for the same root cause
- Loop limit reached (3 retries exhausted)
- Tester finds a bug unrelated to the original task
