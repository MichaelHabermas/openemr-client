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

- **Secrets:** Do not read `.env` or other live environment files. Use `.env.example` and ask the human to verify local values.
- **OAuth boundary:** Keep `client_secret`, token exchange, and token handling server-only. Browser code should call same-origin `/api/*` BFF routes with credentials.
- **Logging:** Do not log access tokens, client secrets, or full raw patient payloads. Prefer sanitized operation/status/error-code logging.
- **OpenEMR boundary:** Do not modify the sibling OpenEMR PHP app, backend behavior, database schema, or seeded fixture files unless the human explicitly changes the project scope.
- **Source of truth:** OpenEMR remains the clinical system of record. This repo owns presentation, routing, BFF proxying, and UI-facing normalization only.

## Product And Design Memory

- **Spiritual fidelity:** Match the original OpenEMR PHP patient dashboard interface (layout, density, section ordering, typography, status treatment) as closely as possible per the absolute canon brief ("do not redesign the interface"; "make it as close as possible"); preserve information hierarchy and clinician muscle memory.
- **Clinical surface tone:** The dashboard should feel like a quiet clinical command center: dense, scannable, stable, accessible, and low-drama.
- **Improve where safety improves:** Explicit empty/error/partial states, text status labels, deliberate patient selection, and clearer section hierarchy are intentional improvements, not departures.
- **Easy transition:** Keep familiar section names and patient-dashboard flow unless there is a concrete safety, clarity, or maintainability reason to change them.

## Proof Gaps

- **Live OpenEMR QA:** Automated tests prove route contracts, normalization, and render behavior, but not live OpenEMR fixture richness, permissions, browser refresh, or responsive layout.
- **Medication source split:** Medications and Prescriptions are separate UI models/cards, but both currently source from `MedicationRequest`; do not claim true source-level separation until live API proof exists.
- **Responsive/browser proof:** Server-rendered component tests do not prove sticky positioning, viewport wrapping, focus behavior, or real browser layout. Use browser QA before calling those complete.
- **Automated proof scope:** E2 OAuth/session hardening and E4 patient feature work were proven with route/config/API/normalizer/component tests, not live OAuth login or live OpenEMR clinical data.
- **Epic snapshots removed:** Do not recreate standalone per-epic completion files for E2/E4. Keep active tracking in `docs/PLAN.md`, durable lessons here, and product acceptance in `docs/PRD.md`.

## Durable Test Lessons

- **BFF route tests:** Prefer in-process Express route handler tests for E1-style BFF seams. The local sandbox may reject localhost socket binds, so tests that require binding random ports can fail for environment reasons even when route behavior is correct.

## FHIR Mapping Notes

- **E3 medications/prescriptions:** `MedicationStatement` support is unverified and must not be assumed without OpenEMR route/API proof. Initial medications and prescriptions proxy work should use `MedicationRequest` for both endpoints until fixture proof shows a better mapping.
- **E4 patient feature boundary:** Raw FHIR parsing belongs in `src/features/patients/normalizers.ts`, not route components. Routes should consume UI-facing models and hooks from `src/features/patients`.
- **E4 dashboard model split:** Medications and prescriptions intentionally have separate UI models even though both currently normalize from `MedicationRequest`; preserve that split so E7 can render them distinctly without duplicating FHIR parsing.
- **E4 test strategy:** For frontend FHIR handling, prefer `bun:test` coverage over unknown input to stable UI models. Keep browser-like component tooling deferred until E5/E6 unless a UI behavior cannot be proven otherwise.
- **E5 route-based selection:** Patient selection is encoded in `/patients/:patientId`, not local route state or auto-selection. Empty patient search results must not clear auth or navigate away.
- **E7 card boundary:** Shared clinical card shells own loading, empty, partial-data, and error rendering. Section cards own clinical field layout. Raw FHIR must stay isolated to `src/features/patients/normalizers.ts`.
- **Component test strategy:** Current frontend component coverage uses `react-dom/server` with Bun tests to avoid adding a DOM test runner. Add DOM tooling only if interaction behavior cannot be proven with pure helpers or server-rendered output.
- **FHIR date-only display:** FHIR date-only values such as `Patient.birthDate` must not be formatted through `new Date("YYYY-MM-DD")` because timezone conversion can shift the displayed day. Preserve the literal date components when rendering labels.
- **Problem status safety:** Missing or unknown `Condition.clinicalStatus` must not be treated as active. Only meaningful non-inactive/non-resolved statuses should produce an active problem label.
