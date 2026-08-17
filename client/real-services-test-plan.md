# Real Services Test Plan

This document is the checklist for the test suite we want once the mock services are replaced with real backend integrations.
It is intentionally not executable. It exists so we can translate each case into automated tests at the right time.

## Auth

- Verify `getMe()` restores the current session on app startup.
- Verify an unauthenticated session clears `GlobalStore`.
- Verify a parent session sets the parent identity in `GlobalStore`.
- Verify an admin session sets the admin identity in `GlobalStore`.
- Verify OTP request, verify, and logout all persist and clear the real session correctly.
- Verify a session that expires between app loads is treated as logged out.
- Verify a refreshed page after login still restores the correct session.
- Verify multiple OTP requests for the same email invalidate the older challenge.
- Verify OTP reuse is rejected after successful verification.
- Verify OTP verification with a different email than the challenge is rejected.
- Verify login works for both known parent emails used in the system.
- Verify logout clears the current session and prevents guarded pages from loading stale data.
- Verify the app bootstraps auth once and does not flash guest-only content for a returning parent.

## Route Guards

- Verify `/login` redirects authenticated users away from the login screen.
- Verify `/login` allows guests to enter the login flow.
- Verify `/home` redirects unauthenticated users to `/login`.
- Verify `/home` allows authenticated parents only.
- Verify `/home/:registrationId` allows authenticated parents only.
- Verify `/registration` stays open for guests and logged-in parents.
- Verify `/registration` redirects a logged-in parent with an active `WaitingForDocuments` registration to `/home/:registrationId`.
- Verify `/registration` redirects a logged-in parent with an active `PendingApproval` registration to `/home/:registrationId`.
- Verify `/registration` allows a logged-in parent with only `Approved`, `Rejected`, or `Cancelled` registrations to start a new registration.
- Verify a saved draft does not bypass the registration guard when the backend returns an active submitted registration.
- Verify parent-only guards do not rely on draft localStorage.
- Verify guest-only guards send authenticated parents to `/home`.
- Verify guest-only guards send authenticated admins to `/admin`.
- Verify parent-only guards keep admins away from parent home screens.
- Verify deep links into `/home/:registrationId` preserve the target URL after redirect to login.
- Verify direct navigation to `/home` after logout is blocked even if the route was previously open.
- Verify guard decisions use the auth session from the facade, not stale component state.

## Registration

- Verify a logged-in parent starts the registration flow at stage 2, with parent details prefilled from the authenticated session.
- Verify a logged-in parent enters the child details and plan-selection flow immediately, without a transient return to the parent-details stage.
- Verify the logged-in parent can keep adding and updating children and plan selections from that same stage before moving forward.
- Verify an anonymous parent starts at the parent-details stage.
- Verify a persisted draft is restored only for authenticated users.
- Verify a logged-in parent with an existing draft starts at the plan/children stage with the draft details as the source of truth.
- Verify saved draft parent details override the authenticated parent profile data while the draft is active.
- Verify child, document, and submission data all come from real registration responses.
- Verify submitted registration data becomes the source of truth after submit.
- Verify uploaded missing documents update the registration status returned by the backend.
- Verify replacement uploads preserve the latest file state returned by the backend.
- Verify a registered parent can restart the flow and reuse their real parent details.
- Verify registration starts from child selection only after auth is confirmed, not before.
- Verify a logged-in parent can manually navigate back to the parent-details stage without being forced forward again.
- Verify parent fields are not overwritten when the authenticated user has already filled different values in the current draft.
- Verify a saved draft for one parent is never restored for another parent.
- Verify switching from guest to logged-in state during the flow hydrates the logged-in parent details once.
- Verify switching from logged-in to logged-out state does not keep privileged draft data accessible.
- Verify all registration stages survive page refresh with real backend state, not local placeholders.
- Verify the child stage correctly handles one child, multiple children, and zero children from backend data.
- Verify child pricing, discounts, and monthly-plan requirements are computed from the real plans returned by the service.
- Verify allergy data appears only when present and stays hidden when absent.
- Verify no fake children, placeholder names, or fallback plans appear when backend data is incomplete.
- Verify submitting with missing parent fields is blocked by validation.
- Verify submitting with missing child details is blocked by validation.
- Verify submitting with missing plan selection is blocked by validation.
- Verify save-and-continue-later preserves real draft data and resumes at the same stage only for the same authenticated parent.
- Verify document scope choices persist across navigation and refresh.
- Verify document upload inputs can be replaced before final submission.
- Verify the documents stage hides the standing-order upload section when the selected plan is a daily plan.
- Verify missing document upload before submit does not accidentally advance to submitted summary.
- Verify submission from the documents stage creates a submitted registration only once, even if the button is clicked repeatedly.
- Verify after submit, the flow displays the submitted summary from backend truth, not draft state.
- Verify successful submit removes the saved draft so reopening registration does not resume stale draft data.
- Verify a registration can be resumed after submit only through the submitted summary state, not by reopening the draft.

## Home

- Verify authenticated parent home loads using the current parent identity.
- Verify active registration, history, and holiday periods are all returned from the backend.
- Verify drilling into a submitted registration opens the submitted summary view.
- Verify missing-document uploads on the home screen update the backend-backed registration state.
- Verify the home screen renders no placeholder parent data when no authenticated parent exists.
- Verify home load is filtered by the authenticated parent's email, not by a generic fallback.
- Verify a parent with no active registration still sees a stable empty home state.
- Verify a parent with multiple registrations sees the latest active registration and the full registration history.
- Verify registration history renders one row per child registration, even when multiple children were submitted in the same parent registration group.
- Verify home history cards do not navigate unless the flow explicitly allows drill-in.
- Verify the submitted-registration card opens the exact submitted summary for the selected registration id.
- Verify home stays on the list view when there is no selected registration id.
- Verify missing-document uploads on home can add, replace, remove, and reupload files before saving.
- Verify saving missing documents updates the visible status returned by the backend.
- Verify the status changes after the final missing file is uploaded.
- Verify uploaded document names reflect the current selected file after replacement.
- Verify the home screen does not show stale selected files after a save or reload.
- Verify the home screen shows holiday periods for the active year only.
- Verify a parent with no allergies in the submitted registration sees no allergy line.
- Verify a parent with allergies sees the allergy details on both home and summary views.
- Verify drill-in from history and drill-in from active registration both resolve the correct registration record.
- Verify navigating directly to `/home/:registrationId` opens the correct summary for that id.
- Verify navigating to another registration id after one is already open replaces the detail view instead of appending it.
- Verify back navigation from the detail view returns to the parent home list without losing the loaded home data.

## Error Paths

- Verify unknown emails fail login cleanly.
- Verify invalid OTP codes fail without changing auth state.
- Verify missing parent home data returns a handled error state.
- Verify missing registration IDs return a handled error state.
- Verify upload failures surface a visible error and do not silently clear the selected file.
- Verify expired sessions produce a handled login or home error, not a blank shell.
- Verify network failures during auth restoration leave the app in a safe logged-out state.
- Verify network failures during registration load keep the user on the registration screen with an actionable error.
- Verify network failures during home load keep the user on the home screen with an actionable error.
- Verify failures during submit do not clear entered registration data.
- Verify failures during document upload do not clear the selected file input.
- Verify a bad registration id in the URL does not crash the home screen.
- Verify a bad parent email in the backend response does not leak data from another parent.
- Verify loading states are cleared after both success and failure paths.
- Verify duplicate clicks during loading do not cause duplicate submissions or duplicate uploads.

## Notifications

- Verify the app renders a single global Spartan Sonner toaster in the shell.
- Verify the notification service contract can be swapped without changing feature code.
- Verify login success shows a success toast.
- Verify login failure shows an error toast.
- Verify logout success shows a success toast and logout failure shows an error toast.
- Verify registration submit success and failure both surface through the notification service.
- Verify missing-document save success and failure both surface through the notification service.
- Verify notification copy stays short and localized for parent-facing flows.

## Data Integrity

- Verify real service responses are treated as the source of truth for parent name, phone, email, registration year, children, plans, documents, and status.
- Verify no route, screen, or store falls back to hardcoded parent data.
- Verify no route, screen, or store falls back to hardcoded registration labels or placeholder names.
- Verify localStorage is only read for drafts after auth is confirmed.
- Verify the app never uses mock-only parents, registrations, years, or plans in the real-service path.
- Verify backend-provided identifiers are preserved end to end.
- Verify child, registration, and document ids are stable across refresh and drill-in.
- Verify empty strings from the backend are displayed as empty states, not replaced by invented copy.
- Verify all backend-driven status labels and document labels are rendered from the real service enum mapping.
- Verify no feature reads from localStorage when the user is not authenticated.
- Verify saved drafts are keyed by the right authenticated parent and not shared across users.
- Verify backend refreshes replace stale client state instead of layering on top of it.

## Suggested Coverage Order

1. Auth session restoration
2. Parent route guards
3. Registration startup and submit flow
4. Home data loading and drill-in
5. Document upload and replacement flows
6. Error handling and empty-state behavior
