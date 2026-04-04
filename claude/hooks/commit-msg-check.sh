#!/bin/bash
# Commit Message Validation — checks format conventions
# PreToolUse hook for Bash tool (git commit commands)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Only check git commit commands
if ! echo "$COMMAND" | grep -qE 'git\s+commit'; then
  exit 0
fi

# Extract commit message from -m flag
MSG=$(echo "$COMMAND" | grep -oP '(?<=-m\s")[^"]*|(?<=-m\s'"'"')[^'"'"']*' | head -1)

# If using heredoc or no -m flag, skip validation
if [ -z "$MSG" ]; then
  exit 0
fi

# Get first line of commit message
FIRST_LINE=$(echo "$MSG" | head -1)

# Check length
if [ ${#FIRST_LINE} -gt 72 ]; then
  echo "Commit message first line exceeds 72 characters (${#FIRST_LINE} chars). Shorten it." >&2
  exit 2
fi

# Check for non-imperative mood (common mistakes)
if echo "$FIRST_LINE" | grep -qiE '^\s*(added|fixed|removed|updated|changed|deleted|created)\b'; then
  echo "Commit message should use imperative mood: 'Add feature' not 'Added feature'." >&2
  exit 2
fi

exit 0
