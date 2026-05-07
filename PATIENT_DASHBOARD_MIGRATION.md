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
- Live QA on 2026-05-07 verified OAuth login, patient search, and live `Patient/:id` header data, but the configured OpenEMR session returned upstream `401` for the clinical FHIR resources. Code inspection of the connected OpenEMR build showed these FHIR search/read routes require SMART `.rs` scopes, so the default app scope now requests `user/Patient.rs`, `user/AllergyIntolerance.rs`, `user/Condition.rs`, `user/MedicationRequest.rs`, `user/CareTeam.rs`, and `user/Encounter.rs`. Medication/prescription, care team, allergy, condition, and encounter mapping remain unverified until a fresh OAuth grant succeeds with those scopes.
- Practitioner and organization references are displayed from FHIR `display` or `reference`; deeper reference resolution is not implemented.
- No clinical write workflows are implemented.
- No AI-generated clinical summaries, recommendations, or transformations are implemented.
