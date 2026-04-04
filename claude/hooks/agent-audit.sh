#!/bin/bash
# Agent Audit Log — logs completed agent executions
# SubagentStop hook

INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.subagent_type // "unknown"')
STATUS=$(echo "$INPUT" | jq -r '.status // "unknown"')
AGENT_ID=$(echo "$INPUT" | jq -r '.subagent_id // "unknown"')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

LOG_DIR="${HOME}/.claude/logs"
mkdir -p "$LOG_DIR"

echo "{\"timestamp\":\"${TIMESTAMP}\",\"agent\":\"${AGENT_TYPE}\",\"status\":\"${STATUS}\",\"agent_id\":\"${AGENT_ID}\"}" >> "${LOG_DIR}/agent-audit.jsonl"

exit 0
