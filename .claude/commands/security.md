---
description: Run a full security scan before raising a PR. Checks dependencies, secrets, and IaC.
allowed-tools: Bash
---

Run a security check before raising this PR:

1. Run trivy fs --severity HIGH,CRITICAL --exit-code 0 . and report findings
2. Run npm audit --audit-level=high if package.json exists, or pip audit if requirements.txt exists
3. Check for any .env files accidentally staged: git diff --cached --name-only | findstr /i env

Summarise findings in this format:
- 🔴 CRITICAL: <count> issues
- 🟠 HIGH: <count> issues
- ✅ or ❌ No secrets staged

If any CRITICAL issues exist, do NOT create the PR. List what needs fixing first.
If only HIGH issues exist, flag them but allow the PR with a warning in the PR description.
