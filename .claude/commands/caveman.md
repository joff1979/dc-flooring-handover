---
description: Reset token usage. Compacts conversation history and re-states only what is needed to continue.
allowed-tools: Read
---

Do the following immediately:

1. Trigger /compact to summarise and compress this conversation
2. After compaction, output ONLY:
   - Current branch: git branch --show-current
   - Last commit: git log --oneline -1
   - What we were working on (one sentence, max 20 words)
   - Next immediate action (one sentence)

Nothing else. No pleasantries. No recap. Straight back to work.
