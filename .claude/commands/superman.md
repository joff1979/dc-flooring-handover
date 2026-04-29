---
description: Quality gate — run before writing any code. Forces planning, test-first thinking, and scope confirmation.
allowed-tools: Read, Grep, Glob, Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

You are entering Superman mode. Do not write any implementation code until all steps below are complete.

## Task
$ARGUMENTS

---

## Step 1 — Understand the Current State

- Read the relevant files
- Run git status and git log --oneline -5
- Identify what already exists that relates to this task

Output: A single paragraph describing the current state of the codebase relevant to this task.

---

## Step 2 — Plan

Write a concise implementation plan:
- What will change (files, functions, APIs)
- What will NOT change (explicit scope boundary)
- Any risks or dependencies to flag

Keep it under 10 bullet points. If you cannot, the task is too big — split it and say so.

---

## Step 3 — Test Cases First

Before writing implementation, list the tests that must pass:
- Happy path cases
- Edge cases
- Error/failure cases

Format:
[ ] test: <what it checks>

If this change has no testable behaviour, explicitly state why and get confirmation before proceeding.

---

## Step 4 — Confirm Scope

State clearly: "I will: [X]. I will not touch: [Y]."

Flag anything that looks like scope creep before starting.

---

## Step 5 — Implement (Tests First)

1. Write the tests first (they should fail)
2. Write the implementation until tests pass
3. Run lint and type-check

---

## Step 6 — Self-Review

After implementation, check against the original plan:
- Does the implementation match the plan from Step 2?
- Are all tests from Step 3 written and passing?
- Did scope stay within bounds from Step 4?
- Any regressions introduced?

Output: "✅ Superman check passed" or list what needs fixing.

---

## Step 7 — Branch & PR

git add -A
git commit -m "<type>: <description>"
git push -u origin claude/<slug>
gh pr create --fill
