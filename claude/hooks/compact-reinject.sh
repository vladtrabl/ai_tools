#!/bin/bash
# Post-Compact Context Reinjection — restores critical orchestration context
# SessionStart hook (matcher: compact)

cat << 'CONTEXT'
Reminder after context compaction:

Agent Response Format: TOON (Token-Oriented Object Notation)
- Flat fields: key: value
- Arrays: array[N|]{field1|field2|...}: with pipe-delimited rows
- Empty arrays: array[0]:

Agent pipeline rules:
- Loop limits: implementer<->reviewer 3 retries, fixer<->tester 3 retries
- Parallel dispatch: independent fixers with run_in_background: true
- User checkpoints: on blocked, critical issues, loop limit reached
CONTEXT

exit 0
