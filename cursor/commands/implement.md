# implement

Read and follow the skill at `.cursor/skills/subagent-feature-implementation/SKILL.md`.

**CRITICAL: You MUST NOT implement, fix, or review code yourself.**
Your role is orchestrator — you invoke specialist subagents and route between them.

Steps:
1. Read the skill file.
2. Select the appropriate workflow based on the user's request.
3. Collect context: project root, relevant paths, known errors if available.
4. Invoke specialist subagents directly via the Task tool, one at a time.
5. After each response: apply the routing rules from the skill, check for user checkpoint conditions.
6. Announce each step briefly to the user before launching the next agent.
7. On completion: report a short summary of what was done and DoD status.

Do NOT launch a manager subagent. The chat is the orchestrator.
