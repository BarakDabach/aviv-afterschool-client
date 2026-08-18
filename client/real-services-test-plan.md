# Real Services Dry-Run Test Plan

This is a manual and integration dry-run specification for the backend-shaped in-memory application. It is intentionally not an automated test suite. Do not add fixture registrations to make any case pass: all registrations must be created through the parent flow.

## Preconditions

- Start from a fresh browser session with the configured mock parent and admin authentication flows available.
- Use the active registration year and plans returned by `DataService`.
- Record the exact values entered during each run: parent name, phone, email, child names, genders, allergies, plan, payment method, file names, and document scopes.
- Use a browser refresh only for the reset case. Logout must preserve repository data.

## Repository And Empty Dashboard

1. Refresh the browser before creating any registration.
2. Authenticate as the configured admin and open `/admin`.
3. Verify the dashboard loads asynchronously with zero registrations, zero waiting queues, zero pending approvals, and metrics derived as zero from the empty repository.
4. Verify no demo registration, fixed total, placeholder parent, or manually maintained admin registration is displayed.
5. Verify loading, empty, and error states are rendered by the dashboard store/component flow.

## Parent Submission With Complete Documents

1. Open the registration flow as a parent.
2. Enter a unique parent name, phone, and email.
3. Add at least two children with distinct names, genders, dates of birth, and allergy values.
4. Select a plan for each child and explicitly select a payment method for each child.
5. Upload every required document, including the correct shared or child-specific scope, using distinctive file names.
6. Submit the registration.
7. Verify the returned registration has repository-generated registration and document IDs, creation/submission timestamps, uploaded timestamps, `PendingReview` document state, stored payment methods, selected plans, pricing, allergies, year, parent, and children.
8. Verify the registration starts in `PendingApproval` and no required document is missing.
9. Verify the parent home reads the submitted registration from `DataService` and shows the exact values entered.

## Parent Submission With Missing Documents

1. Create a second registration with a different parent and child set.
2. Select a plan/payment combination that requires a document and omit at least one required upload.
3. Submit the registration.
4. Verify the registration starts in `WaitingForDocuments` and the missing requirement contains the correct document type and scope.
5. Upload the missing document through the parent flow.
6. Verify the matching requirement is replaced, the new document is `PendingReview`, and status recalculates to `PendingApproval` when all requirements are present.

## Data And Projection Fidelity

1. In admin, verify both registrations appear under the correct queue for the active year.
2. Verify exact propagation of parent name, phone, email, children, genders, allergies, plan labels, prices, payment methods, file names, document types, and scopes.
3. Verify shared documents appear once in the shared-document group.
4. Verify child-specific documents appear under the matching child only.
5. Verify missing documents are projected from registration requirements and are not a separate admin fixture.
6. Verify dashboard totals, queue counts, registered-child count, and remaining capacity change only when stored registrations change.
7. Verify registrations from other years are excluded from the active-year dashboard.

## Authentication And Route Protection

1. Logout as the parent.
2. Log in with the configured admin identity and open `/admin`.
3. Verify the dashboard shows the parent-created registrations without code or fixture changes.
4. While authenticated as a parent, navigate directly to `/admin`; verify access is redirected to the parent home.
5. While unauthenticated, navigate directly to `/admin`; verify access is redirected to login and the requested URL is preserved as the redirect target.
6. Verify logout clears the session only and does not remove registrations.

## Document Review And Readiness

1. In a pending approval registration, verify uploaded documents initially show the pending review state.
2. Use the admin document action to approve a document.
3. Verify the stored document changes to `Approved` and receives a review timestamp.
4. Verify the parent-visible registration reads the updated document state from the same repository.
5. Approve each required document and verify readiness recalculates from stored review state and required documents.
6. Attempt approval before readiness; verify the command fails, the status does not change, and an error notification is shown.
7. Verify duplicate document actions are ignored while the registration mutation is busy.

## Payment Method And Required Documents

1. Change a child from cash to standing order in the parent registration flow and submit.
2. Verify the child domain record stores `StandingOrder` and the standing-order requirement is calculated for the correct scope.
3. In admin, change the payment method and reload the dashboard.
4. Verify the parent-visible registration reflects the new method and recalculated missing-document state.
5. Change a child to cash and verify the child-specific standing-order requirement/document is removed or no longer required.
6. Attempt to switch a pending approval child to standing order without its required document; verify the command returns an expected error and does not partially update the registration.
7. Verify payment controls use the same stored child state as the dashboard projection.

## Registration Approval And Parent State

1. Approve all required documents for a ready pending approval registration.
2. Approve the registration from admin.
3. Verify the registration changes to `Approved` and leaves the pending queues.
4. Return to the parent home and verify the same registration is `Approved` with unchanged parent, child, plan, payment, pricing, and document data.
5. Attempt approval for a waiting-for-documents registration; verify the confirmation/override behavior and expected readiness error path.

## Permanent Removal

1. Request removal for a registration from admin.
2. Cancel the confirmation and verify no data changes.
3. Confirm removal and verify the registration disappears from the dashboard.
4. Verify the parent home can no longer load that registration from the repository.
5. Verify dashboard metrics and queue counts recalculate after removal.

## Invalid Actions, Errors, And Busy State

- Approve an unknown registration ID: expect a domain error and error notification.
- Approve an unknown document ID: expect a domain error and unchanged registration.
- Change payment for an unknown child: expect a domain error and unchanged registration.
- Remove an unknown registration: expect a domain error and unchanged dashboard data.
- Trigger a second mutation while one registration is busy: expect the duplicate action to be ignored.
- Force a dashboard read failure: verify store error state and failure notification without stale mutation success.
- Verify successful mutations reload the dashboard read model through `AdminFacade` instead of patching a precomputed snapshot.

## Refresh Reset

1. Create and submit at least one parent registration.
2. Confirm it appears in admin and parent views during the current browser session.
3. Refresh the browser completely.
4. Verify the in-memory repository starts empty, the dashboard returns to zero derived totals, and the former registration is gone.
5. Verify a logout without refresh does not reset the repository.

## Architecture Verification

- `MockDataService` starts with an empty registration repository.
- No dashboard registration fixture, demo registration, fixed dashboard total, or admin-only registration map is required.
- Parent reads, parent writes, admin reads, and admin commands use the same registration collection.
- Reads and writes are asynchronous and return cloned DTO-shaped values.
- Registration and document IDs are generated by repository-owned counters.
- Registration, document, and review timestamps are stored on domain records.
- Admin dashboard data is a projection/read model derived from `RegistrationState`.
- `AdminDashboardStore` owns loading, error, confirmation, busy, notifications, computed queues, metrics, and reload-after-mutation behavior.
- `AdminDashboard` remains a thin store-driven component.
- Browser refresh resets the process-local repository; logout preserves it.
