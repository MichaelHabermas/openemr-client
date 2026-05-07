# AgentForge Memory

## What This File Is For

Use this file for notes that future AgentForge work should not forget:

- Architecture decisions that should remain stable.
- Safety and privacy guardrails that must apply across epics.
- Bugs, proof gaps, and test lessons discovered during implementation.
- Acceptance caveats that are easy to lose when an epic file is refreshed.
- Short summaries of prior context that help new work stay aligned.

Do not use this file as the primary task tracker. The source of truth for active execution remains the current specs, architecture docs, plans, and the code. This file is for carry-forward memory, not for replacing those documents.

## Update Ritual

Before replacing an active epic file, copy durable lessons here if they will matter later. Good candidates are:

- A bug that was fixed and could reappear.
- A safety rule that affected design.
- A command or gate with an important caveat.
- A deferred proof item that future milestones must close.
- A schema or contract decision that downstream work depends on.

Keep entries concise. Prefer notes that will change future engineering behavior over narrative progress logs.

## Global AgentForge Guardrails

- **Secrets and automation boundary:**
- 

## Durable Test Lessons

- **BFF route tests:** Prefer in-process Express route handler tests for E1-style BFF seams. The local sandbox may reject localhost socket binds, so tests that require binding random ports can fail for environment reasons even when route behavior is correct.
