# OpenEMR Patient Dashboard Modernization Brief

## Goal

Port the OpenEMR patient dashboard presentation layer to this repository's Vite + React + TypeScript application while preserving OpenEMR as the clinical system of record.

The work should reimplement dashboard presentation and data orchestration only. Do not modify the sibling OpenEMR PHP application, database schema, or backend behavior in `/Users/michaelhabermas/repos/GAI/openemr`. The React app should consume OpenEMR's existing OAuth2/OpenID Connect, REST, and FHIR APIs through the existing Express BFF.

The target is feature parity with the challenge brief in `docs/AgentForge—Clinical-Co-Pilot-W2—Surprise-Challenge_Modernize-the-Patient-Dashboard.txt` and the product requirements in `docs/PRD.md`, not a speculative redesign of clinical workflows.

## Current State

- The repo already uses Bun, Vite, React, and TypeScript.
- The frontend lives under `src/`.
- The Express BFF lives under `server/`.
- OAuth login, callback, logout, and a basic patient-list FHIR proxy already exist.
- `/patients` currently renders a basic FHIR Patient bundle as patient name/id rows.
- The dashboard route, persistent patient header, required clinical cards, encounter history, expanded FHIR typing, and migration defense document still need to be implemented.

## Architecture Principles

- Use Bun for scripts and package workflows.
- Keep OAuth client secrets and token exchange server-only.
- Keep browser code talking only to same-origin `/api/*` BFF routes.
- Prefer OpenEMR-supported FHIR resources before OpenEMR REST fallbacks.
- Keep route components thin.
- Deepen `src/features/patients` into the primary patient-dashboard module.
- Separate raw FHIR wire types from UI-facing dashboard models.
- Normalize FHIR payloads once at the feature boundary instead of parsing optional nested FHIR structures throughout components.
- Apply SOLID, DRY, and modular design by giving API transport, FHIR normalization, route orchestration, and presentation separate responsibilities.

## Backend And FHIR Plan

Expand the BFF from the existing patient bundle proxy into patient-scoped clinical resource proxies.

Required BFF endpoints:

- `GET /api/patients`
- `GET /api/patients/:patientId`
- `GET /api/patients/:patientId/allergies`
- `GET /api/patients/:patientId/problems`
- `GET /api/patients/:patientId/medications`
- `GET /api/patients/:patientId/prescriptions`
- `GET /api/patients/:patientId/care-team`
- `GET /api/patients/:patientId/encounters`

FHIR resource mapping:

| Dashboard Section | Preferred OpenEMR API Source |
| --- | --- |
| Patient header | `Patient/:id` |
| Allergies | `AllergyIntolerance?patient={patientId}` |
| Problem List | `Condition?patient={patientId}` |
| Medications | `MedicationRequest?patient={patientId}` first; document any fallback |
| Prescriptions | `MedicationRequest?patient={patientId}` first; document distinction from Medications |
| Care Team | `CareTeam?patient={patientId}` |
| Encounter History | `Encounter?patient={patientId}` |

Treat `MedicationStatement` as unavailable unless implementation later verifies it in OpenEMR FHIR routes. If Medications and Prescriptions are both initially backed by `MedicationRequest`, keep them visually and semantically separate and document the mapping in `PATIENT_DASHBOARD_MIGRATION.md`.

Update default OAuth scope to OpenEMR FHIR read/search dashboard needs:

```text
openid api:fhir api:oemr user/Patient.rs user/AllergyIntolerance.rs user/Condition.rs user/MedicationRequest.rs user/CareTeam.rs user/Encounter.rs
```

Harden OAuth state during implementation:

- Generate a per-login `state` value in `GET /login`.
- Store it in a transient httpOnly cookie.
- Validate it in `GET /callback`.
- Clear it after successful or failed validation.
- Keep `client_secret` only in server config and OAuth token exchange code.

Standardize BFF error mapping:

- Missing cookie: `401 { "error": "not_authenticated" }`.
- Upstream OAuth/token failure: redirect to `/?error=oauth` and log only sanitized details.
- Upstream FHIR `401`: clear token cookie and return `401 { "error": "upstream_auth_failed" }`.
- Upstream FHIR `403`: return `403 { "error": "forbidden" }`.
- Upstream FHIR `404`: return `404 { "error": "not_found" }`.
- Upstream FHIR `400`: return `400 { "error": "bad_fhir_request" }`.
- Upstream network or `5xx`: return `502 { "error": "fhir_unavailable" }`.

## Frontend Plan

Keep `/patients` as the deliberate patient search and selection entry point. Add `/patients/:patientId` as the patient dashboard route.

Recommended feature module shape:

- `src/features/patients/api.ts`: patient-specific client calls wrapping `src/lib/api/http.ts`.
- `src/features/patients/fhir.ts` or `src/features/patients/normalizers.ts`: FHIR bundle/resource guards and normalization.
- `src/features/patients/types.ts`: UI-facing `PatientSummary`, `PatientDashboardModel`, and clinical row types.
- `src/features/patients/hooks.ts`: `usePatients` and `usePatientDashboard(patientId)`.
- `src/features/patients/components/`: patient list, patient row, dashboard shell, patient header, clinical cards, and encounter history.

Route responsibilities:

- `src/routes/PatientsPage.tsx` should compose patient search/list components.
- Add a dashboard route component that reads `patientId` from route params and composes the dashboard feature.
- Routes should not parse FHIR bundles or know clinical resource field mapping.

Patient list behavior:

- Show a search input.
- Filter by display name, given/family names, patient id, DOB, sex, and MRN/identifier where present.
- Show rows as keyboard-accessible links or buttons.
- Each row must show name, DOB, sex, MRN/identifier, and active status when available.
- Use explicit fallbacks such as `Unknown`, `Not recorded`, and `No MRN`.
- Do not auto-select the first patient.
- Empty searches should not clear authentication or navigate away.

Dashboard layout:

- Persistent patient identity header at top.
- Required clinical card grid below the header:
  - Allergies
  - Problem List
  - Medications
  - Prescriptions
  - Care Team
- Encounter History as the additional wider section below the clinical cards.

Clinical card behavior:

- Each card must load independently.
- Each card must have independent loading, empty, partial-data, and error states.
- One failed resource must not blank the entire dashboard.
- Missing fields should render explicit fallback text.
- Status must not rely on color alone; include text labels.
- Encounter History should sort reverse chronologically when dates exist.

## Required Dashboard Fields

Patient header:

- Name from FHIR `Patient.name`.
- Date of birth from `Patient.birthDate`.
- Sex from `Patient.gender`.
- MRN from an appropriate `Patient.identifier`.
- Active status from `Patient.active`.

Allergies:

- Allergen/substance.
- Clinical status.
- Verification status.
- Reaction when available.
- Severity when available.

Problem List:

- Condition text/code.
- Clinical status.
- Onset or recorded date when available.
- Category when available.
- Active/resolved distinction with text.

Medications:

- Medication name.
- Status.
- Dosage instructions when available.
- Authored/effective date when available.
- Prescriber/requester when available.

Prescriptions:

- Medication name.
- Status.
- Intent when available.
- Authored date when available.
- Dosage when available.
- Requester/prescriber when available.

Care Team:

- Participant name or reference.
- Role.
- Status.
- Contact/reference information when available.

Encounter History:

- Type/class.
- Status.
- Start date/time.
- End date/time when available.
- Location when available.
- Participant/provider when available.

## Required Documentation

The implementation must add `PATIENT_DASHBOARD_MIGRATION.md` at the repository root.

That document must include:

- Why Vite + React + TypeScript was chosen.
- What was gained by moving dashboard presentation out of PHP-rendered pages.
- Tradeoffs introduced by the architecture:
  - BFF complexity.
  - Duplicated presentation logic.
  - Client-side loading and error states.
  - Route and data orchestration.
  - Build tooling.
  - OAuth/session hardening.
- A data mapping table for every dashboard section.
- A clear statement that OpenEMR remains the system of record.
- A clear statement that the OpenEMR backend, database, and PHP app were not modified.
- Known limitations and demo-data assumptions.
- The Medications versus Prescriptions mapping, especially if both are backed by `MedicationRequest`.

## Test Plan

Run these commands before delivery:

```bash
bun run typecheck
bun run lint
bun run format:check
bun test
bun run build
```

Add focused Bun tests for:

- FHIR normalization and malformed bundle handling.
- Patient display helpers.
- Client API error behavior.
- BFF FHIR URL construction and patient-id/query encoding.
- OAuth token exchange behavior.
- OAuth state validation.
- Server error mapping.

Prefer extracting an Express app factory from `server/index.ts` so route tests can inject fake OAuth and FHIR services without starting the listener at import time.

Manual QA must cover:

- OAuth login and callback.
- Logout and cookie clearing.
- Missing or expired cookie behavior.
- Patient search.
- Patient dashboard navigation.
- Independent clinical card loading, empty, partial, and error states.
- Fixture patients Alex Testpatient and Riley Medmix from the sibling OpenEMR demo fixture.
- Keyboard access and visible focus states.
- No access tokens, client secrets, or raw PHI payloads in browser logs, client bundles, or server logs.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| FHIR payload variation breaks UI rendering | Normalize raw resources into UI models and test missing/malformed fields. |
| Medications and Prescriptions overlap in OpenEMR data | Keep separate cards and document mapping clearly. |
| OAuth/client secret leakage | Keep token exchange and secrets in the BFF only; never expose server env through `VITE_`. |
| PHI leakage in logs or errors | Use generic user-facing errors and sanitized server logs. |
| Dashboard route grows too broad | Keep routes thin and push data/model/card logic into `src/features/patients`. |
| One resource failure breaks dashboard | Fetch and render clinical cards independently. |
| No current automated tests | Start with Bun unit tests around normalizers, helpers, API client, and BFF services. |

## Acceptance Criteria

- `PLAN.md` exists at the repository root and describes the implementation plan.
- `/patients` remains the search/selection entry point.
- `/patients/:patientId` is the dashboard route in the later implementation.
- Patient list rows include name, DOB, sex, MRN/identifier, and active status with explicit fallbacks.
- Dashboard header displays name, DOB, sex, MRN, and active status from live FHIR Patient data.
- Required cards render live data for Allergies, Problem List, Medications, Prescriptions, and Care Team.
- Encounter History renders as the additional API-backed section.
- Each card has independent loading, empty, partial-data, and error states.
- OAuth scopes cover all selected dashboard resources.
- OAuth state is generated and validated.
- `PATIENT_DASHBOARD_MIGRATION.md` exists and defends the framework, architecture, data mapping, benefits, and tradeoffs.
- Verification commands pass before final delivery.

## Assumptions

- The sibling repo `/Users/michaelhabermas/repos/GAI/openemr` is reference-only.
- Implementation will not read live `.env`; use `.env.example` and ask a human to verify local values.
- OpenEMR remains the source of truth for patient and clinical data.
- Dashboard work is read-only clinical display work; clinical write workflows are out of scope.
- AI-generated clinical summaries, diagnoses, treatment suggestions, and medication recommendations are out of scope.
