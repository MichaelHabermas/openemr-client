# Epic: OAuth And Session Hardening

**Generated:** 2026-05-07
**Scope:** Backend BFF auth/session hardening
**Status:** Complete

---

## Overview

Implement OAuth state hardening and reusable BFF auth/error foundations before the dashboard adds more patient-scoped endpoints. The epic keeps token exchange server-side, replaces static OAuth state with transient httpOnly state cookies, updates dashboard read scopes, and standardizes protected-route and FHIR failure responses.

---

## Tasks

### Task 1.1: Add OAuth state and session helpers
**Status:** [x] Complete
**Description:** Add constants and small helper modules for OAuth state cookies and access-token session cookies.
**Acceptance Map:** E2.T1, E2.T3, PRD Story 1 OAuth state requirement.
**Proof Required:** Bun tests for state generation, cookie options, callback matching, and token cookie helpers.

**Subtasks:**
- [x] Add `oauthStateCookieName`.
- [x] Add cryptographically strong OAuth state generation.
- [x] Add explicit state cookie options with httpOnly, sameSite lax, root path, production secure, and 10 minute maxAge.
- [x] Add shared access-token cookie set/clear/read helpers.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `feat(auth): harden oauth state handling`

---

### Task 1.2: Wire OAuth login and callback hardening
**Status:** [x] Complete
**Description:** Update login and callback routes to use per-login state, validate callback state before token exchange, and sanitize OAuth failure behavior.
**Acceptance Map:** E2.T2, E2.T3, E2.T5, PRD Story 1 OAuth failure/state criteria.
**Proof Required:** Route tests for login state, callback missing/mismatched/matching state, and token exchange failure.

**Subtasks:**
- [x] Generate and store state in `GET /login`.
- [x] Build OAuth authorize URL with encoded URL parameters and no client secret.
- [x] Reject missing or mismatched callback state before token exchange.
- [x] Clear state cookie after callback success and failure.
- [x] Redirect OAuth failures to the controlled `/?error=oauth` path.
- [x] Log only sanitized OAuth failure categories.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `fix(auth): validate oauth callback state`

---

### Task 1.3: Add reusable protected-route and FHIR error foundation
**Status:** [x] Complete
**Description:** Add stable browser-facing API error codes and use them in the current patient-list proxy so E3 endpoints can reuse the same boundary.
**Acceptance Map:** User-approved E3 auth foundation, BRIEF standardized BFF error mapping, E3.T2/E3.T3 groundwork.
**Proof Required:** Route/helper tests for missing cookie and mapped upstream FHIR 400/401/403/404/5xx/network failures.

**Subtasks:**
- [x] Add stable API error response codes.
- [x] Add FHIR error mapper that does not leak raw upstream details.
- [x] Update `/api/patients` to use shared access-token lookup.
- [x] Clear access-token cookie on upstream FHIR 401.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `feat(api): standardize protected route errors`

---

### Task 1.4: Update dashboard read-only OAuth scopes
**Status:** [x] Complete
**Description:** Replace the default OAuth scope with read-only scopes needed for the final dashboard resources.
**Acceptance Map:** E2.T4, PRD Story 1 required OAuth scopes.
**Proof Required:** Config test asserting the exact default scope.

**Subtasks:**
- [x] Update default `OAUTH_SCOPE` value in config.
- [x] Document optional scope override in `.env.example` if needed.
- [x] Assert the default scope in config tests.
- [x] Add or update proof for each acceptance criterion this task claims.
- [x] Update this epic file with completed proof or an explicit gap.

**Suggested Commit:** `fix(config): default to dashboard read scopes`

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

- 2026-05-07: Implemented OAuth state generation/validation, session cookie helpers, controlled FHIR error mapping, read-only dashboard scopes, and route/config proof. Verified with `bun test` and `bun run typecheck`. No manual OAuth login was performed; E2 required automated BFF proof only.

---

## Acceptance Matrix

- [x] OAuth state is generated per login -> `server/auth/oauth-state.ts`, `/login` route tests.
- [x] OAuth state is stored in transient httpOnly cookie -> `setOAuthStateCookie`, `/login` cookie option tests.
- [x] Callback validates state before token exchange -> `/callback` missing/mismatched/success tests.
- [x] State cookie clears on success and failure -> `/callback` route tests.
- [x] Token exchange remains server-side -> unchanged `OAuthService` boundary, `/callback` route orchestration.
- [x] OAuth failures use controlled redirect and sanitized logs -> `/callback` failure paths and route tests.
- [x] Default scopes match dashboard read-only needs -> `server/config.ts`, `server/config.test.ts`.
- [x] Missing API cookie returns `not_authenticated` -> `/api/patients` route test.
- [x] FHIR 400/401/403/404/5xx/network failures map to controlled JSON -> `/api/patients` mapped-error tests.
- [x] Upstream FHIR 401 clears access token cookie -> `/api/patients` upstream 401 test.

## Definition Of Done Gate

- Source criteria mapped to code/proof/deferral? yes
- Required automated tests executed and captured? yes, `bun test`
- Required manual checks executed and captured? yes, none required for E2 beyond automated BFF proof
- Required fixtures/data/users for proof exist? yes, fake services in route tests
- Security/privacy/logging/error-handling requirements verified? yes
- Known limitations and deferred relationship/scope shapes documented? yes, E3 clinical endpoints remain deferred
- Epic status updated honestly? yes
- Git left unstaged and uncommitted unless user asked otherwise? yes
