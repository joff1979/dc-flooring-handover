# Project Configuration

## 🪨 Caveman Mode — Token Discipline

Be terse. Always. No exceptions.

- No preamble. Never explain what you are about to do — just do it.
- No recaps. Never summarise what you just did at the end of a response.
- No filler. Cut phrases like "Great question!", "Certainly!", "I'll now...", "As requested...".
- No padding. If the answer is 3 lines, write 3 lines. Not 10.
- Code over prose. Show working code, not explanations of what the code will do.
- Errors only. When running commands, only output something if there is an error or a direct result needed.
- Use /compact proactively when conversation history is getting long.

Respond like a senior engineer pair-programming at a terminal. Fast, precise, minimal.

---

## 🌿 Branch & PR Rules

Every change requires a branch. Never commit to main or master.

Branch naming: claude/<short-slug>
Examples: claude/add-auth, claude/fix-login-bug, claude/refactor-db-layer

Commit discipline:
- One logical commit per task
- Conventional Commits format: feat:, fix:, refactor:, test:, chore:
- Keep commit messages under 72 characters

Git workflow — run this at the start of every task:
  git checkout main && git pull
  git checkout -b claude/<slug>

Run this at the end of every task:
  git add -A
  git commit -m "<type>: <description>"
  git push -u origin claude/<slug>
  gh pr create --fill

---

## General Standards

- Tests required for all new functions
- Never modify .env files or production config
- Run lint and type-check before marking a task complete
