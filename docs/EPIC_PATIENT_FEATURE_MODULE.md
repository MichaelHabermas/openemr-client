# Epic: Patient Feature Module

**Generated:** 2026-05-07
**Scope:** Frontend patient feature boundary
**Status:** Complete

---

## Overview

Deepened `src/features/patients` into the frontend boundary for patient dashboard data. The route layer no longer parses raw FHIR bundles; patient API calls, partial FHIR shapes, normalizers, UI-facing models, and async hooks now live behind the patient feature module.

---

## Tasks

### Task 4.1: Add patient API boundary
**Status:** [x] Complete
**Description:** Add patient-specific API client methods for all E3 BFF endpoints with typed, safe error handling.
**Acceptance Map:** PLAN E4 expected output for patient API methods; PRD implementation requirement for dashboard-specific API client methods.
**Proof Required:** Bun tests for endpoint paths, patient ID encoding, 401 handling, and non-JSON error handling.

**Subtasks:**
- [x] Add feature API methods for patient list, patient detail, allergies, problems, medications, prescriptions, care team, and encounters.
- [x] Encode patient IDs in all path-based methods.
- [x] Convert non-OK responses into typed `PatientFeatureApiError` instances with safe messages.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `feat(patients): add feature api boundary`

---

### Task 4.2: Add FHIR guards and UI normalizers
**Status:** [x] Complete
**Description:** Convert unknown/raw FHIR payloads into UI-facing patient and dashboard row models with explicit fallbacks.
**Acceptance Map:** PLAN E4 expected outputs for bundle helpers, UI-facing model types, and normalizers; PRD testing requirements for missing and malformed fields.
**Proof Required:** Bun tests for invalid bundles, patient identity fallbacks, MRN selection, coding/reference/date/status fallbacks, sparse clinical resources, medication/prescription separation, and encounter sorting.

**Subtasks:**
- [x] Expand partial dashboard-focused FHIR types without introducing a full FHIR SDK.
- [x] Add UI-facing patient, header, clinical row, and async state types.
- [x] Add safe bundle extraction for typed resource collections.
- [x] Add normalizers for Patient, AllergyIntolerance, Condition, MedicationRequest, CareTeam, and Encounter.
- [x] Keep medication and prescription models separate while both currently source from MedicationRequest.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `feat(patients): normalize dashboard fhir models`

---

### Task 4.3: Add feature hooks and async state
**Status:** [x] Complete
**Description:** Add reusable hooks for patient list, patient identity, and independent clinical resource loading.
**Acceptance Map:** PLAN E4 async state pattern; PRD performance requirement that clinical sections can load independently.
**Proof Required:** Typecheck and lint proof for hook contracts; normalizer/API tests cover the boundaries used by hooks.

**Subtasks:**
- [x] Add `LoadState<T>` with loading, success, empty, and error forms.
- [x] Add `usePatients` and `usePatient`.
- [x] Add independent clinical resource hooks for allergies, problems, medications, prescriptions, care team, and encounters.
- [x] Treat 401 API failures as auth-required feature errors.
- [x] Add cancellation guards for stale async results.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `feat(patients): add dashboard data hooks`

---

### Task 4.4: Refactor current patient route to consume the module
**Status:** [x] Complete
**Description:** Remove route-local FHIR parsing from `/patients` and render normalized `PatientSummary` values.
**Acceptance Map:** PLAN E4 Definition of Done: route components no longer parse FHIR directly, components consume UI-facing models.
**Proof Required:** Typecheck, lint, and build proof.

**Subtasks:**
- [x] Replace route-local bundle extraction with `usePatients`.
- [x] Render normalized name, DOB, sex, MRN, and active status labels.
- [x] Preserve logout behavior.
- [x] Keep full search/navigation UX deferred to E5.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `refactor(patients): consume feature models in route`

---

### Task 4.5: Update docs and tracker
**Status:** [x] Complete
**Description:** Capture E4 completion proof and durable architecture decisions in project docs.
**Acceptance Map:** User request to update docs as work proceeds; PLAN E4 status tracking.
**Proof Required:** This epic file, `docs/PLAN.md`, and `docs/MEMORY.md` updated.

**Subtasks:**
- [x] Create `EPIC_PATIENT_FEATURE_MODULE.md`.
- [x] Update `docs/PLAN.md` E4 with completion note and proof.
- [x] Update `docs/MEMORY.md` with durable patient feature boundary decisions.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `docs(patients): record e4 completion`

---

## Review Checkpoint

- [x] Every source acceptance criterion has code, test, human proof, or a named gap.
- [x] Every required proof item has an executable path before implementation starts.
- [x] Boundary/orchestration behavior is tested when a boundary changed.
- [x] Security/logging/error-handling requirements were implemented or explicitly reported as gaps.
- [x] Human verification items are checked only after they were actually performed.
- [x] Known fixture/data/user prerequisites for manual proof are created or explicitly assigned as tasks.

---

## Change Log

- 2026-05-07: Implemented the patient feature API boundary, dashboard-focused FHIR types, runtime-safe normalizers, async feature hooks, and `/patients` route refactor. Verified with `bun test`, `bun run typecheck`, `bun run lint`, and `bun run build`.

---

## Acceptance Matrix

- [x] Patient API client methods exist for all BFF endpoints -> `src/features/patients/api.ts`, `src/features/patients/api.test.ts`.
- [x] Patient IDs are encoded in path-based client calls -> `patient-scoped methods encode patient ids and call all E3 endpoints`.
- [x] Browser API errors use safe messages and typed auth-required state -> `PatientFeatureApiError`, API tests for 401 and non-JSON errors.
- [x] Generic FHIR bundle helpers exist and tolerate malformed input -> `bundleEntriesOf`, normalizer tests.
- [x] UI-facing patient/dashboard model types exist -> `src/features/patients/types.ts`.
- [x] Normalizers exist for Patient, AllergyIntolerance, Condition, MedicationRequest, CareTeam, and Encounter -> `src/features/patients/normalizers.ts`.
- [x] Missing and malformed fields render explicit fallbacks and do not throw -> normalizer tests for sparse patient and clinical resources.
- [x] Medications and prescriptions are separate UI models while both currently source from MedicationRequest -> normalizer test for semantic separation.
- [x] Encounter rows sort reverse chronologically when dates exist -> encounter sorting test.
- [x] Async loading/success/error/empty pattern exists -> `LoadState<T>` and patient hooks.
- [x] Route components no longer parse FHIR directly -> `src/routes/PatientsPage.tsx` consumes `usePatients` and `PatientSummary`.
- [x] Components consume UI-facing models -> `/patients` renders normalized summary fields.

## Definition Of Done Gate

- Source criteria mapped to code/proof/deferral? yes
- Required automated tests executed and captured? yes, `bun test`
- Required manual checks executed and captured? yes, none required for E4 beyond automated/static proof
- Required fixtures/data/users for proof exist? yes, hand-written FHIR fixtures in Bun tests
- Security/privacy/logging/error-handling requirements verified? yes, safe API errors and no browser storage added
- Known limitations and deferred relationship/scope shapes documented? yes, E5-E8 UI work remains deferred
- Epic status updated honestly? yes
- Git left unstaged and uncommitted unless user asked otherwise? yes
