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
4. Select a plan for each child. Do not expose or require a parent-facing payment method choice.
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

## Admin Working Years Overview

1. Log in as an administrator and open `/admin/years`; verify the current year is the first prominent control and uses the numeric `start-year/end-year` label.
2. Open `/admin/current-year`; verify it redirects to `/admin/years` and remains protected by the administrator guard.
3. With no submitted registrations, verify the current-year summary shows zero children, zero used capacity, the service-provided maximum capacity and insurance amount, and an empty children state.
4. With no historical years, verify the current year remains visible and the separate empty-history state is shown.
5. Submit registrations through the parent registration flow, reload `/admin/years`, and verify every rendered child comes from those submissions without admin-only fixtures.
6. Verify each child row shows name, gender, selected plan, payment method, and `מצב הרשמה`, but never shows age or date of birth.
7. Verify all registration states returned by the service map to the correct Hebrew status text and accessible badge treatment.
8. Mark a boy and a girl as having left through the real yearly-membership service; verify only those children show `הוסר` and `הוסרה` respectively.
9. Verify active children do not show any removal label.
10. Verify the total child count includes active and removed children while used capacity includes only children with yearly status `Active`, regardless of registration approval state.
11. Create registrations with child-local IDs that repeat across different registrations; verify all children render as distinct rows.
12. Add multiple historical years through the real year service; verify they appear newest first and each expands to the same child fields as the current year.
13. Force the overview service to fail; verify the page shows a safe Hebrew error state and retry reloads the service data.
14. Verify the current-year summary and each historical-year summary block uses the shared card component that matches the dashboard card composition (`value`, `label`, `detail`, and icon bubble) and respects RTL/LTR behavior for numeric fields.
15. In desktop width (`1440 × 1024`) and mobile width (`390 × 844`), verify that the summary cards on `/admin` and `/admin/years` have consistent visual hierarchy and spacing.
16. Verify create, duplicate, and edit actions remain disabled until the shared year form is introduced and do not issue service mutations.
15. Verify the mobile accordion works at `390 × 844`, the desktop dashboard layout works at `1440 × 1024`, all content is RTL, and no row or action is clipped.

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
2. Verify exactly four fixed programs are shown: `4-5 פעמים בשבוע`, `3 פעמים בשבוע`, `2 פעמים בשבוע`, and `חד פעמי`.
3. Verify the fixed prices are shown exactly: ₪1350, ₪1050, ₪850, and ₪100.
4. Verify every plan shows the same hours: `13:00-17:00`.
5. Verify the weekly plans show monthly price metadata and the `חד פעמי` plan shows daily price metadata.
6. Verify each plan card has a comfortable tap target, readable plan title, readable description, visible radio indicator, and no clipped text.
7. Verify long Hebrew plan labels and prices wrap cleanly without overlapping the radio indicator or adjacent content.
8. Select and unselect different plans; verify the selected visual state does not resize the card or shift nearby controls.
9. Add multiple children and verify all child plan cards keep the same mobile sizing and spacing.
10. Switch to tablet/desktop widths and verify the cards still match the denser layout expected on larger screens.

## Fixed Program Catalog And Parent Payment Rules

1. Load the plan catalog through `DataService`; verify it returns exactly the four daycare programs and does not include old placeholder plans.
2. Verify `4-5 פעמים בשבוע` has price 1350, hours `13:00-17:00`, is active, and requires standing order.
3. Verify `3 פעמים בשבוע` has price 1050, hours `13:00-17:00`, is active, and requires standing order.
4. Verify `2 פעמים בשבוע` has price 850, hours `13:00-17:00`, is active, and requires standing order.
5. Verify `חד פעמי` has price 100, hours `13:00-17:00`, is active, and does not require standing order.
6. Submit a one-child registration with `4-5 פעמים בשבוע` and no standing-order file; verify the stored child payment method is `StandingOrder` and the registration is `WaitingForDocuments`.
7. Submit a one-child registration with `3 פעמים בשבוע` and no standing-order file; verify the stored child payment method is `StandingOrder` and the registration is `WaitingForDocuments`.
8. Submit a one-child registration with `2 פעמים בשבוע` and no standing-order file; verify the stored child payment method is `StandingOrder` and the registration is `WaitingForDocuments`.
9. Submit a one-child registration with `חד פעמי` and no standing-order file; verify the stored child payment method is `Cash` and no standing-order document is required.
10. In the parent registration UI, verify changing plans automatically updates the hidden stored payment type according to the selected plan and never asks the parent to choose cash or standing order.
11. Start with `חד פעמי`, then switch to a weekly plan before submitting; verify the submitted registration uses `StandingOrder` and requires standing-order approval.
12. Start with a weekly plan, then switch to `חד פעמי` before submitting; verify the submitted registration uses `Cash` and does not require standing-order approval.
13. Restore a saved draft whose child payment method is stale or missing; verify submission derives the final payment method from the selected plan instead of trusting the draft value.
14. Submit a mixed multi-child registration with one weekly child and one `חד פעמי` child; verify only the weekly child requires standing-order approval.
15. Submit a mixed multi-child registration with all three weekly plan types; verify each child stores `StandingOrder` and standing-order requirements are satisfied by either the chosen shared document or the matching child-specific documents.
16. Verify the landing page plan list matches the same four fixed programs, prices, and hours as the registration flow.

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

1. Submit each weekly plan from the parent flow and verify the child domain record stores `StandingOrder`.
2. Submit the `חד פעמי` plan from the parent flow and verify the child domain record stores `Cash`.
3. Verify the parent flow never exposes payment controls even though the stored child state has a payment method.
4. Verify standing-order requirements are calculated only for children whose selected plan requires standing order and whose stored payment method is `StandingOrder`.
5. Verify no standing-order requirement is calculated for a `חד פעמי` child whose stored payment method is `Cash`.
6. In admin, change the payment method and reload the dashboard.
7. Verify the parent-visible registration reflects the new method and recalculated missing-document state.
8. In admin, switch a waiting-for-documents child from cash to standing order without uploading a standing-order document; verify the command succeeds and the registration remains `WaitingForDocuments`.
9. Verify the missing requirements now include the standing-order approval requirement for the correct child or shared scope.
10. In admin, switch the same child from standing order back to cash; verify the standing-order requirement is removed while unrelated missing documents remain.
11. In admin, switch a pending-approval child from cash to standing order without uploading a standing-order document; verify the command succeeds, the registration recalculates to `WaitingForDocuments`, and the dashboard moves it to the waiting queue after reload.
12. In admin, switch a pending-approval child from standing order to cash when the only missing or pending item is the standing-order approval; verify the document requirement is no longer required and the registration status recalculates from the remaining requirements.
13. In admin, switch one child to cash in a multi-child registration where another child still requires standing order; verify the other child's requirement remains intact.
14. In admin, switch one child to standing order in a multi-child registration where documents are scoped per child; verify only that child receives a standing-order missing requirement.
15. In admin, switch one child to standing order when an all-children standing-order document already exists; verify no duplicate requirement is created for that child.
16. In admin, click the already-selected payment method; verify the command is idempotent, no duplicate documents or missing requirements are created, and the dashboard remains stable.
17. Verify payment controls use the same stored child state as the dashboard projection.
18. Verify payment-method clicks inside an expanded registration do not collapse the registration container.

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
