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
7. While authenticated as an admin, navigate directly to `/registration`; verify the registration flow opens instead of redirecting away.
8. While authenticated as a parent with an existing active registration, navigate directly to `/registration`; verify the registration flow opens and allows starting another registration.
9. While authenticated as an admin, submit a registration through `/registration`; verify the created registration is stored as a normal submitted registration and appears in the admin queues according to its status.

## Login Accessibility And OTP Flow

1. Open the login screen on a mobile viewport.
2. Focus the email field and verify it exposes email semantics: `type="email"`, `inputmode="email"`, `autocomplete="email"`, `dir="ltr"`, required state, and accessible label support.
3. Enter a valid email and press Enter or the virtual keyboard next action; verify focus moves to the request-code button and does not submit an incomplete form unexpectedly.
4. Request an OTP code and verify the OTP step renders the email value and a visible change-email action.
5. Verify the OTP control is the Spartan input OTP control, uses six slots, accepts numeric entry, exposes one-time-code autocomplete behavior, and has accessible label, description, invalid, and error messaging.
6. Enter Hebrew UI text around the OTP field and verify the numeric OTP slots remain left-to-right so digits appear in the same order typed.
7. Paste or type six digits; verify the verify-login button receives focus after completion.
8. On mobile, enter six digits and verify the focused OTP input blurs so the virtual keyboard closes.
9. Enter fewer than six digits and blur the field; verify the validation error is announced/rendered without focusing the verify button.
10. Enter non-digit characters or paste mixed content; verify only valid OTP digits are accepted by the OTP control and validation remains correct.
11. Enter six digits while the verify button is disabled or a verification request is loading; verify no focus error occurs and the busy state is preserved.
12. From the OTP step, use the visible change-email action; verify the form returns to the email step with the email available for editing.
13. From the OTP step, use the browser back button; verify the flow returns to the email step instead of leaving the login flow in a broken OTP-only state.
14. Navigate forward/back repeatedly between email and OTP steps; verify browser history, form state, validation, and focus remain consistent.

## Registration Form Accessibility And Mobile Input Flow

1. Open the registration flow on a mobile viewport.
2. In parent details, focus the full-name field and press Enter or the virtual keyboard next action; verify focus moves to the phone field.
3. Focus the phone field and verify the mobile keyboard is numeric/tel-oriented, the field is left-to-right, and the value remains readable inside the Hebrew form.
4. Press Enter or next from the phone field; verify focus moves to the email field.
5. Press Enter or done from the parent email field; verify the form does not create an accidental submission and the user can continue using the primary navigation controls.
6. In child details, focus the child-name field and press Enter or next; verify focus moves to the birth-date input.
7. Focus the birth-date input and verify it supports numeric input mode, birthday autocomplete, required state, described-by helper/error text, and invalid state.
8. Press Enter or next from the birth-date input; verify focus moves to the next relevant field without opening an unrelated control.
9. Toggle allergy state and verify allergy detail input participates in the next/done flow when it is visible.
10. Verify disabled, readonly, hidden, and `data-focus-next-skip` controls are skipped by keyboard navigation.
11. Verify date-picker clear/calendar icon buttons are skipped by next-field navigation and remain independently clickable/tappable.
12. Verify validation errors remain associated with the correct field after focus moves through the form.
13. Verify the same focus-next behavior works for multiple children and does not jump into a different child section unexpectedly.

## Registration Plan Cards And Mobile Sizing

1. On a mobile viewport, open the child plan-selection stage.
2. Verify each plan card has a comfortable tap target, readable plan title, readable description, visible radio indicator, and no clipped text.
3. Verify long Hebrew plan labels and prices wrap cleanly without overlapping the radio indicator or adjacent content.
4. Select and unselect different plans; verify the selected visual state does not resize the card or shift nearby controls.
5. Add multiple children and verify all child plan cards keep the same mobile sizing and spacing.
6. Switch to tablet/desktop widths and verify the cards still match the denser layout expected on larger screens.

## Document Review And Readiness

1. In a pending approval registration, verify uploaded documents initially show the pending review state.
2. Use the admin document action to approve a document.
3. Verify the stored document changes to `Approved` and receives a review timestamp.
4. Verify the parent-visible registration reads the updated document state from the same repository.
5. Approve each required document and verify readiness recalculates from stored review state and required documents.
6. Attempt approval before readiness; verify the command fails, the status does not change, and an error notification is shown.
7. Verify duplicate document actions are ignored while the registration mutation is busy.
8. In a waiting-for-documents registration, verify uploaded documents can still be reviewed while other required documents remain missing.
9. Attempt to approve a document row that has no uploaded file; verify the command fails and the missing requirement remains unchanged.
10. Approve the same uploaded document twice; verify the second action is ignored or leaves the document idempotently approved without corrupting timestamps or status.

## Payment Method And Required Documents

1. Change a child from cash to standing order in the parent registration flow and submit.
2. Verify the child domain record stores `StandingOrder` and the standing-order requirement is calculated for the correct scope.
3. In admin, change the payment method and reload the dashboard.
4. Verify the parent-visible registration reflects the new method and recalculated missing-document state.
5. Change a child to cash and verify the child-specific standing-order requirement/document is removed or no longer required.
6. In admin, switch a waiting-for-documents child from cash to standing order without uploading a standing-order document; verify the command succeeds and the registration remains `WaitingForDocuments`.
7. Verify the missing requirements now include the standing-order approval requirement for the correct child or shared scope.
8. In admin, switch the same child from standing order back to cash; verify the standing-order requirement is removed while unrelated missing documents remain.
9. In admin, switch a pending-approval child from cash to standing order without uploading a standing-order document; verify the command succeeds, the registration recalculates to `WaitingForDocuments`, and the dashboard moves it to the waiting queue after reload.
10. In admin, switch a pending-approval child from standing order to cash when the only missing or pending item is the standing-order approval; verify the document requirement is no longer required and the registration status recalculates from the remaining requirements.
11. In admin, switch one child to cash in a multi-child registration where another child still requires standing order; verify the other child's requirement remains intact.
12. In admin, switch one child to standing order in a multi-child registration where documents are scoped per child; verify only that child receives a standing-order missing requirement.
13. In admin, switch one child to standing order when an all-children standing-order document already exists; verify no duplicate requirement is created for that child.
14. In admin, click the already-selected payment method; verify the command is idempotent, no duplicate documents or missing requirements are created, and the dashboard remains stable.
15. Verify payment controls use the same stored child state as the dashboard projection.
16. Verify payment-method clicks inside an expanded registration do not collapse the registration container.

## Registration Approval And Parent State

1. Approve all required documents for a ready pending approval registration.
2. Approve the registration from admin.
3. Verify the registration changes to `Approved` and leaves the pending queues.
4. Return to the parent home and verify the same registration is `Approved` with unchanged parent, child, plan, payment, pricing, and document data.
5. Attempt approval for a waiting-for-documents registration; verify the admin receives the exceptional-approval confirmation dialog.
6. Cancel the exceptional approval; verify the registration remains `WaitingForDocuments`, no review state changes, and the dashboard queue is unchanged.
7. Confirm the exceptional approval; verify the registration changes to `Approved` even when one or more required documents were never uploaded.
8. Verify the approved registration leaves both pending admin queues after the dashboard reloads.
9. Verify the parent home reads the same approved registration and still shows missing/unuploaded document history accurately.
10. Verify exceptional approval is available only through the admin dashboard action and not through the parent flow.

## Admin Dashboard Interaction And Mobile Layout

1. Open `/admin` on mobile with at least one waiting-for-documents registration and one pending-approval registration.
2. Expand a registration and verify the full expanded content renders inside the container with no clipped bottom content.
3. Click every button inside the expanded container: payment methods, document approve/open actions, registration approve, registration remove, and confirmation actions.
4. Verify none of those internal button clicks collapse the registration container unless the explicit collapsible trigger is clicked.
5. Tap inside document rows, child sections, and payment controls; verify pointer events do not bubble into the collapsible trigger.
6. Verify mobile text, chips, counters, payment buttons, and action buttons are large enough to read and tap without zooming.
7. Verify long parent names, child names, plan names, document labels, and file names wrap without overlapping action buttons.
8. Verify the same dashboard remains compact and usable on desktop after the mobile sizing changes.
9. Verify the admin dashboard store exposes a callable `load` method and all mutation paths can reload the dashboard after success.
10. Trigger payment change, document approval, registration approval, and removal; verify each uses the same reload-after-mutation behavior and does not throw `store.load is not a function`.

## Submitted Registration Details Reuse

1. Complete a registration and verify the final registration step shows the shared submitted registration details view instead of the removed summary-stage component.
2. From the parent home, open `צפייה בפרטי ההרשמה` for the same registration and verify it uses the same layout, labels, document rows, pricing, and status display as the completion step.
3. Verify `סיכום הזמנה` is not duplicated in the parent-level and child-level sections.
4. Verify child cards do not render a redundant child-name title above their details.
5. Verify the registration completion step does not show the parent-home back link when configured not to show it.
6. Verify the parent-home details page does show the configured back link.
7. For a waiting-for-documents registration, upload a missing document from the parent-home details view and verify the registration status recalculates through the store.
8. For a waiting-for-documents registration, upload a missing document from the registration completion details view and verify it uses the same missing-document selection, removal, filename, and save behavior.
9. Select then remove a missing document file before saving; verify the selected filename clears and no upload is sent.
10. Save multiple missing documents in one action; verify each file maps to the correct document type and scope.
11. Save when no missing document files are selected; verify the action is disabled or no-op without changing registration state.
12. Verify the removed summary-stage files are no longer imported or rendered anywhere in the registration flow.

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
- `RegistrationDetailsView` is a presentational shared component reused by parent home details and registration completion, with all data and actions supplied through inputs and outputs.
- The removed registration summary stage has no remaining route, import, template reference, or test dependency.
- Registration focus-next behavior is provided by a reusable directive and does not move business logic into templates.
- Date picker input accessibility attributes are passed through the UI library component to the native input.
- Login OTP behavior stays in the login feature component/store boundary and uses the Spartan OTP primitive instead of a hand-rolled multi-input control.
- Browser refresh resets the process-local repository; logout preserves it.
