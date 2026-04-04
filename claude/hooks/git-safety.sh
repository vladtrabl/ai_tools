#!/bin/bash
# Git Safety Guard — blocks force push, reset --hard, checkout ., clean -fd
# PreToolUse hook for Bash tool

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Check for dangerous git commands
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force|git\s+push\s+-f\b'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Force push blocked by git-safety hook. Use explicit user approval."}}' >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "Git reset --hard blocked by git-safety hook. This discards uncommitted changes." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+checkout\s+\.'; then
  echo "Git checkout . blocked by git-safety hook. This discards all unstaged changes." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qE 'git\s+clean\s+-[a-zA-Z]*f'; then
  echo "Git clean -f blocked by git-safety hook. This deletes untracked files." >&2
  exit 2
fi

exit 0
