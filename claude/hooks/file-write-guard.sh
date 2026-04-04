#!/bin/bash
# File Write Guard — prevents writing to sensitive files
# PreToolUse hook for Write and Edit tools

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Normalize to lowercase for checking
FILE_LOWER=$(echo "$FILE_PATH" | tr '[:upper:]' '[:lower:]')
BASENAME=$(basename "$FILE_LOWER")

# Block .env files (but allow .env.example)
if echo "$BASENAME" | grep -qE '^\.env(\.|$)' && ! echo "$BASENAME" | grep -qE '\.example$|\.sample$|\.template$'; then
  echo "Writing to .env file blocked by file-write-guard hook. Environment files may contain secrets." >&2
  exit 2
fi

# Block credentials/secrets files
if echo "$BASENAME" | grep -qiE 'credentials|secrets|password|\.pem$|\.key$|\.pfx$|\.p12$'; then
  echo "Writing to sensitive file blocked by file-write-guard hook: ${BASENAME}" >&2
  exit 2
fi

exit 0
