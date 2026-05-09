# Patient Dashboard Migration Defense

## Summary

This project moves the OpenEMR patient dashboard presentation layer into the existing Vite, React, and TypeScript app while keeping OpenEMR as the clinical system of record. The React app consumes OpenEMR OAuth and FHIR data through the Express BFF in this repository. It does not modify the OpenEMR PHP app, OpenEMR backend behavior, or the OpenEMR database schema.

## Why Vite, React, And TypeScript

Vite gives the dashboard fast local feedback and a conventional production build without replacing the repo's existing frontend stack. React fits the dashboard because the UI is a set of independently loading clinical sections with repeated state patterns. TypeScript makes the boundary between raw FHIR payloads and UI-facing models explicit, which is important when source data contains many optional nested fields.

The implementation keeps FHIR parsing in `src/features/patients/normalizers.ts`, transport in API wrappers and the BFF, orchestration in hooks, and rendering in components. That separation lets the application test clinical display mapping without spreading FHIR optional-field handling across route components.

## What Changed By Moving Presentation Out Of PHP

The dashboard can now render patient identity, clinical cards, and encounter history as a client-side experience while OpenEMR remains authoritative for authentication and clinical data. The frontend can show independent loading, empty, partial-data, and error states for each section so one failing resource does not hide the rest of the dashboard.

The patient list is now a deliberate patient picker. Search is route-based and opens stable URLs like `/patients/:patientId`; the app does not auto-select the first returned patient.

## Data Mapping

| Dashboard section | BFF endpoint | OpenEMR FHIR source | UI mapping |
| --- | --- | --- | --- |
| Patient header | `GET /api/patients/:patientId` | `Patient/:id` | Name, birth date, sex, MRN/identifier, active status |
| Allergies | `GET /api/patients/:patientId/allergies` | `AllergyIntolerance?patient={patientId}` | Substance, clinical status, verification status, reaction, severity, recorded date |
| Problem List | `GET /api/patients/:patientId/problems` | `Condition?patient={patientId}` | Condition text/code, clinical status, verification status, onset or recorded date, category, active/resolved distinction |
| Medications | `GET /api/patients/:patientId/medications` | `MedicationRequest?patient={patientId}` | Medication, status, dosage, authored date, requester/prescriber |
| Prescriptions | `GET /api/patients/:patientId/prescriptions` | `MedicationRequest?patient={patientId}` | Medication, status, intent, authored date, dosage, requester/prescriber |
| Care Team | `GET /api/patients/:patientId/care-team` | `CareTeam?patient={patientId}` | Participant, role, status, member reference |
| Encounter History | `GET /api/patients/:patientId/encounters` | `Encounter?patient={patientId}` | Type, class, status, start, end, location, participant/provider |

## Medications Versus Prescriptions

OpenEMR FHIR support for `MedicationStatement` has not been verified in this repo. The first-pass implementation uses `MedicationRequest` for both Medications and Prescriptions. The cards remain visually and model-wise separate: Medications emphasize medication context, dosage, date, and prescriber; Prescriptions also show request intent so order-like information is not hidden.

This is a known limitation. If live OpenEMR API verification later proves a better source for medication history or prescriptions, the BFF resource mapping and normalizer can change while preserving the existing UI component boundary.

## Tradeoffs

- BFF complexity: OAuth token exchange, cookie handling, and FHIR proxy routes add server code, but keep secrets and access tokens out of browser-accessible storage.
- Duplicated presentation logic: Some dashboard display rules move out of PHP and into React. The clinical source of truth remains OpenEMR; the duplication is limited to presentation models and labels.
- Client-side loading and errors: The React app must handle independent resource state for each card. This adds UI states, but prevents one upstream failure from blanking the dashboard.
- Route and data orchestration: Stable patient URLs improve navigation and testing, but require route-level patient IDs and careful encoding.
- Build tooling: Vite introduces a frontend build artifact and typecheck step, but gives fast iteration and typed client code.
- OAuth/session hardening: The BFF must generate and validate OAuth state and clear cookies on auth failures. This is extra code, but it keeps the security boundary server-side.

## Known Limitations And Assumptions

- The dashboard uses read/search FHIR resources only.
- Live OpenEMR fixture QA is still required to confirm exact data richness and any OpenEMR-specific medication/prescription distinction.
- Live QA on 2026-05-07 verified OAuth login, patient search, and live `Patient/:id` header data. The configured OpenEMR session initially returned upstream `401` for clinical FHIR resources because the default OAuth scopes used `.read` instead of `.rs` (read+search). This was corrected on 2026-05-09; all six clinical endpoints now load live data successfully.
- OpenEMR's `AllergyIntolerance` resources use FHIR `data-absent-reason` in the `code` field and place the actual substance name (e.g., "Penicillin") in the resource's `text.div` narrative. The normalizer falls back to narrative text extraction when `code` resolves to "Unknown".
- Practitioner and organization references are displayed from FHIR `display` or `reference`; deeper reference resolution is not implemented. When OpenEMR omits `display` on participant member references, raw FHIR reference strings (e.g., `Practitioner/<uuid>`) are shown.
- No clinical write workflows are implemented.
- No AI-generated clinical summaries, recommendations, or transformations are implemented.

## Visual Fidelity

As of 2026-05-09, the E11 epic brought the dashboard into closest possible alignment with the original PHP-rendered patient dashboard, audited against `docs/screenshots/`.

### What was aligned

- **Layout**: 4-zone structure matching original — dark header bar, dashboard title with static tab bar, 3-column inline sections (Allergies, Medical Problems, Medications), full-width tables below.
- **Density**: Tightened spacing from `space-y-6` to `space-y-2`/`space-y-4`, `text-xs` throughout clinical sections.
- **Section headers**: Blue underlined text matching original style, replacing Card wrappers with shadows and borders.
- **Tables**: HTML `<table>` elements for Prescriptions, Care Team, and Encounter History, matching original PHP table rendering.
- **Inline text**: Allergies show "substance (severity)", Problems show just the condition name, Medications show "name dosage" — no colored status badges in clinical sections.
- **Patient header**: Light background with avatar icon, inline name and MRN, DOB/Age/Sex on second line, matching original PHP dashboard styling.
- **Tab bar**: Static Dashboard, History, Assessments, Report, Documents, Transactions, Issues, Ledger, External Data tabs matching original navigation structure.

### Known deviations

- **Care Team Type, Note, Remove**: These columns render "—" because the standard FHIR `CareTeam` resource does not carry these fields; they may be OpenEMR UI extensions.
- **Encounter History**: This is an addition not present in the original dashboard; included as the challenge-required additional API-backed section.
- **Tab bar is non-functional**: Tabs are static display only; the original PHP dashboard has functional tab navigation.
- **Care Team member names**: When OpenEMR omits `display` on participant references, raw FHIR reference strings are shown instead of human-readable names. Resolving these would require additional FHIR API calls per reference.

### What was preserved from the modern implementation

- **Independent loading and error states**: Each clinical section loads independently, so one failed FHIR resource does not blank the entire dashboard. The original PHP dashboard does not have this behavior.
- **Semantic HTML with ARIA**: Section landmarks, `aria-labelledby`, `aria-live` for loading states, and `role="alert"` for errors.
- **Responsive grid**: The 3-column inline section grid collapses to single column on mobile viewports.
- **Keyboard navigation**: All interactive elements remain keyboard-accessible.

This decision is recorded here and in the E11 epic in `docs/PLAN.md`. OpenEMR remains the system of record; only presentation was adjusted for fidelity.
