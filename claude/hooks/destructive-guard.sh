#!/bin/bash
# Destructive Command Guard — blocks rm -rf, drop table, truncate, docker prune
# PreToolUse hook for Bash tool

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

if echo "$COMMAND" | grep -qiE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f|rm\s+-[a-zA-Z]*f[a-zA-Z]*r'; then
  echo "rm -rf blocked by destructive-guard hook. Review the command manually." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qiE 'drop\s+table|drop\s+database|truncate\s+table'; then
  echo "DROP/TRUNCATE blocked by destructive-guard hook. Database operations require manual review." >&2
  exit 2
fi

if echo "$COMMAND" | grep -qiE 'docker\s+system\s+prune'; then
  echo "Docker system prune blocked by destructive-guard hook." >&2
  exit 2
fi

exit 0
