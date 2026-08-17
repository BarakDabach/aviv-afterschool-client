# Development Requirements - System Design

## Purpose

This file defines the first implementation shape for the application models, classes, and services.

The goal is to keep the app as simple as possible:

- One shared domain model language for client and server.
- Thin client view models for the screens.
- Server services that own business rules, status transitions, files, and persistence.
- No separate identity system for parents in the first version. Parent lookup is by phone number.
- One admin user in the first version: Aviv.

The product requirements live in `after_school_app_requirements.md`.
The UI and screen references live in `design.md` and `mockups/`.

## Application Areas

### Parent/Public

Screens:

- Landing page and plan selection.
- Parent registration lookup by phone.
- My registrations list.
- My registration status.
- Registration wizard:
  - Step 1: parent details and sibling reuse.
  - Step 2: shared contract and signature.
  - Step 3: shared document uploads.
  - Step 4: summary.

### Admin

Screens:

- Admin home/dashboard.
- School years list.
- Current year registrations.
- Create/edit school year.
- View registration / document review.

## Screen-Derived Data Needs

### Landing Page

Needs:

- Active school year.
- Public visibility flag.
- General public content.
- Registration steps content.
- FAQ/rules content.
- Available plans with name, description, days/hours, price, and availability.
- Annual insurance amount.

### Parent Registration Lookup

Needs:

- Phone number input.
- Parent lookup result.
- Zero, one, or many yearly registrations for the phone number.

### My Registrations List

Needs:

- Parent name and phone.
- Child cards.
- Per-child school year.
- Per-child selected plan.
- Per-child overall registration status.
- Per-child next action label.
- Sibling/shared-document indicators.

### My Registration Status

Needs:

- Child summary.
- Parent summary.
- Selected year and plan.
- Overall registration status.
- Status rows for details, contract, standing order, and insurance payment.
- Shared contract/upload indicators.
- Signed contract download link.
- Rejection reason when a document was rejected.

### Registration Wizard

Needs:

- Draft registration group for one parent and one or more children.
- Parent details.
- Child-specific details.
- Allergy/sensitivity answer and details per child.
- Selected plan per child.
- Shared contract for one or more child registrations.
- Signer name.
- Digital signature image/data.
- Standing order upload, optionally shared.
- Insurance receipt upload, optionally shared.
- Calculated insurance total.
- Summary statuses after submit.

### Admin Home

Needs:

- Active/current school year.
- Metrics:
  - total active children.
  - year capacity.
  - completed registrations.
  - registrations pending review.
- Pending registration cards.
- Stage summary per registration:
  - details.
  - contract.
  - standing order.
  - insurance.
- Sibling/shared-document badges.

### Admin Years

Needs:

- List of school years.
- Current/active year marker.
- Registration open/closed marker.
- Public visibility marker.
- Capacity, active child count, and plan count.
- Actions:
  - create year.
  - duplicate previous year.
  - open current year.

### Admin Current Year

Needs:

- Search by child, parent, or phone.
- Filters:
  - with allergies.
  - age.
  - registration status.
- Registration rows/cards for children in the selected school year.
- Allergy badge.
- Child history action.
- Remove from year action.

### Admin Create/Edit Year

Needs:

- School year name.
- Start/end dates.
- Active year flag.
- Registration open flag.
- Public visibility flag.
- Capacity.
- Insurance amount.
- Plans with prices and availability.
- Procedures text.
- Parent instructions text.
- Contract upload/version.
- Publish/save action.

### Admin View Registration

Needs:

- Parent/family summary.
- Children linked to the registration group.
- Shared-document alert.
- Registration stage statuses.
- Per-child registration details.
- Allergy/sensitivity details.
- Contract file and signature status.
- Standing order file review.
- Insurance receipt file review.
- Approve/reject actions.
- Internal note.
- Single save action for review changes.

## Common Domain Models

Use these shared model names on both client and server. In TypeScript, prefer `type` or `interface` for plain data. Use classes only where behavior is useful.

### Base Types

```ts
type ID = string;
type ISODate = string;
type ISODateTime = string;
type PhoneNumber = string;
type MoneyAmount = number;
```

Money is stored as a number in ILS for this simple version. If sub-shekel precision becomes important later, move to integer agorot.

### Enums / Literal Types

```ts
type UserRole = 'admin' | 'parent';

type SchoolYearStatus = 'draft' | 'active' | 'archived';

type RegistrationStatus =
  | 'draft'
  | 'details_complete'
  | 'waiting_for_contract'
  | 'waiting_for_documents'
  | 'pending_review'
  | 'completed'
  | 'removed';

type StageStatus = 'empty' | 'pending' | 'done' | 'rejected';

type ReviewStatus = 'not_uploaded' | 'uploaded' | 'approved' | 'rejected';

type DocumentType = 'contract' | 'standing_order' | 'insurance_receipt';

type UploadedFileKind = 'pdf' | 'image';

type AllergyAnswer = 'yes' | 'no';

type PlanAvailability = 'available' | 'unavailable';
```

### Parent

```ts
type Parent = {
  id: ID;
  fullName: string;
  phone: PhoneNumber;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- `phone` is unique for parent lookup in version 1.
- No parent ID number is stored.

### Child

```ts
type Child = {
  id: ID;
  parentId: ID;
  fullName: string;
  birthDate: ISODate;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- No child ID number is stored.
- Allergies are not stored on `Child`; they belong to the yearly registration.

### SchoolYear

```ts
type SchoolYear = {
  id: ID;
  name: string;
  startsOn: ISODate;
  endsOn: ISODate;
  status: SchoolYearStatus;
  registrationOpen: boolean;
  publicVisible: boolean;
  capacity: number;
  insuranceAmount: MoneyAmount;
  proceduresText: string;
  parentInstructionsText: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- Only one school year should be `active`.
- Public parent screens use the active year only when `publicVisible` is true.

### Plan

```ts
type Plan = {
  id: ID;
  schoolYearId: ID;
  name: string;
  description: string;
  daysAndHours: string;
  price: MoneyAmount;
  paymentTerms?: string;
  availability: PlanAvailability;
  sortOrder: number;
};
```

Rules:

- Plans belong to a school year.
- A registration stores the selected `planId`; plan edits should not silently rewrite old signed contracts.

### RegistrationGroup

Represents one parent registration session that can include siblings and shared documents.

```ts
type RegistrationGroup = {
  id: ID;
  parentId: ID;
  schoolYearId: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- A group can contain one or more child yearly registrations.
- Shared contract and shared files attach to this group and list their target registration IDs.

### YearlyRegistration

```ts
type YearlyRegistration = {
  id: ID;
  groupId: ID;
  parentId: ID;
  childId: ID;
  schoolYearId: ID;
  planId: ID;
  status: RegistrationStatus;
  detailsStatus: StageStatus;
  contractStatus: StageStatus;
  standingOrderStatus: ReviewStatus;
  insuranceStatus: ReviewStatus;
  allergyAnswer: AllergyAnswer;
  allergyDetails?: string;
  insuranceAmountDue: MoneyAmount;
  removedAt?: ISODateTime;
  removalReason?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- One child can have one active yearly registration per school year.
- Status is derived from the stage statuses where possible.
- Removing a child from a year sets `status = 'removed'`; it does not delete the child, group, contract, or files.

### ContractVersion

```ts
type ContractVersion = {
  id: ID;
  schoolYearId: ID;
  fileId?: ID;
  versionLabel: string;
  uploadedAt: ISODateTime;
  active: boolean;
};
```

Rules:

- The signed contract stores the exact `contractVersionId`.
- Only one active contract version per school year.

### SignedContract

```ts
type SignedContract = {
  id: ID;
  groupId: ID;
  schoolYearId: ID;
  contractVersionId: ID;
  registrationIds: ID[];
  signerName: string;
  signatureFileId: ID;
  signedContractFileId?: ID;
  signedAt: ISODateTime;
};
```

Rules:

- One signed contract can cover siblings.
- Every covered yearly registration has `contractStatus = 'done'`.

### UploadedFile

```ts
type UploadedFile = {
  id: ID;
  originalName: string;
  mimeType: string;
  kind: UploadedFileKind;
  sizeBytes: number;
  storagePath: string;
  uploadedByRole: UserRole;
  uploadedAt: ISODateTime;
};
```

Rules:

- Files are stored separately from business review state.
- Files can be reused by shared document submissions.

### DocumentSubmission

```ts
type DocumentSubmission = {
  id: ID;
  groupId: ID;
  schoolYearId: ID;
  documentType: Exclude<DocumentType, 'contract'>;
  fileId: ID;
  registrationIds: ID[];
  status: ReviewStatus;
  reviewedByAdminId?: ID;
  reviewedAt?: ISODateTime;
  rejectionReason?: string;
  internalNote?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
```

Rules:

- `standing_order` and `insurance_receipt` are manually reviewed by admin.
- One submission can apply to several yearly registrations.
- Rejection reason is visible to parents. Internal note is admin-only.

### AdminUser

```ts
type AdminUser = {
  id: ID;
  displayName: string;
  role: 'admin';
  active: boolean;
};
```

Version 1 contains one admin user: Aviv.

### AuditEvent

```ts
type AuditEvent = {
  id: ID;
  actorRole: UserRole;
  actorId?: ID;
  action:
    | 'registration_created'
    | 'contract_signed'
    | 'document_uploaded'
    | 'document_approved'
    | 'document_rejected'
    | 'registration_removed'
    | 'registration_restored'
    | 'school_year_saved';
  entityType: string;
  entityId: ID;
  createdAt: ISODateTime;
  note?: string;
};
```

Rules:

- Audit events are append-only.
- Use for admin review, removals/restores, contract signing, and school year publishing.

## Derived View Models

These are read models returned by the server for screens. They should be cheap to consume on the client.

### PublicHomeView

```ts
type PublicHomeView = {
  schoolYear: Pick<
    SchoolYear,
    'id' | 'name' | 'registrationOpen' | 'insuranceAmount' | 'proceduresText' | 'parentInstructionsText'
  >;
  plans: Plan[];
};
```

### ParentRegistrationsView

```ts
type ParentRegistrationsView = {
  parent: Pick<Parent, 'id' | 'fullName' | 'phone'>;
  registrations: Array<{
    registrationId: ID;
    childId: ID;
    childName: string;
    schoolYearName: string;
    planName: string;
    status: RegistrationStatus;
    statusLabel: string;
    nextActionLabel: string;
    hasSharedDocuments: boolean;
  }>;
};
```

### RegistrationStatusView

```ts
type RegistrationStatusView = {
  parent: Pick<Parent, 'fullName' | 'phone'>;
  child: Pick<Child, 'id' | 'fullName' | 'birthDate'>;
  schoolYearName: string;
  planName: string;
  overallStatus: RegistrationStatus;
  rows: Array<{
    key: 'details' | 'contract' | 'standing_order' | 'insurance';
    label: string;
    status: StageStatus | ReviewStatus;
    statusLabel: string;
    shared: boolean;
    rejectionReason?: string;
    downloadFileId?: ID;
  }>;
};
```

### AdminDashboardView

```ts
type AdminDashboardView = {
  schoolYear: Pick<SchoolYear, 'id' | 'name' | 'capacity'>;
  metrics: {
    activeChildren: number;
    capacity: number;
    completed: number;
    pendingReview: number;
  };
  pendingRegistrations: AdminRegistrationListItem[];
};
```

### AdminRegistrationListItem

```ts
type AdminRegistrationListItem = {
  groupId: ID;
  registrationIds: ID[];
  title: string;
  parentName: string;
  parentPhone: PhoneNumber;
  childNames: string[];
  planNames: string[];
  overallStatus: RegistrationStatus;
  hasAllergies: boolean;
  hasSiblings: boolean;
  hasSharedDocuments: boolean;
  stages: Array<{
    label: string;
    status: StageStatus | ReviewStatus;
  }>;
};
```

### AdminRegistrationDetailView

```ts
type AdminRegistrationDetailView = {
  groupId: ID;
  parent: Pick<Parent, 'id' | 'fullName' | 'phone'>;
  children: Array<{
    child: Child;
    registration: YearlyRegistration;
    plan: Plan;
  }>;
  signedContract?: SignedContract;
  standingOrderSubmissions: DocumentSubmission[];
  insuranceSubmissions: DocumentSubmission[];
  filesById: Record<ID, UploadedFile>;
  auditEvents: AuditEvent[];
};
```

### SchoolYearDetailView

```ts
type SchoolYearDetailView = {
  schoolYear: SchoolYear;
  plans: Plan[];
  activeContractVersion?: ContractVersion;
  counts: {
    activeChildren: number;
    completedRegistrations: number;
    pendingReviewRegistrations: number;
  };
};
```

### RegistrationDraftResponse

```ts
type RegistrationDraftResponse = {
  group: RegistrationGroup;
  parent: Parent;
  children: Child[];
  registrations: YearlyRegistration[];
  selectedPlans: Plan[];
  signedContract?: SignedContract;
  documentSubmissions: DocumentSubmission[];
};
```

## Client Stack Design

The current client is Angular. Keep the client as a thin UI layer.

### Client Model Files

Suggested structure:

```txt
client/src/app/models/
  common.model.ts
  parent.model.ts
  school-year.model.ts
  registration.model.ts
  document.model.ts
  admin.model.ts
  view-models.model.ts
```

Rules:

- These files contain TypeScript types/interfaces only.
- Avoid duplicating backend business logic in model classes.
- Status labels should come from a small client helper or from server view models, not from each component.

### Client State Classes

Use these only where screen state is more than a simple form.

#### RegistrationDraftState

Owns the multi-step registration wizard state.

```ts
type RegistrationDraftState = {
  activeStep: number;
  parent: {
    fullName: string;
    phone: PhoneNumber;
  };
  children: Array<{
    localId: string;
    fullName: string;
    birthDate: ISODate | '';
    allergyAnswer: AllergyAnswer;
    allergyDetails: string;
    planId: ID | '';
  }>;
  signerName: string;
  signatureDataUrl?: string;
  standingOrderFile?: File;
  insuranceReceiptFile?: File;
  sharedStandingOrder: boolean;
  sharedInsuranceReceipt: boolean;
};
```

Responsibilities:

- Add/remove child rows.
- Validate current wizard step.
- Calculate insurance total for the visible summary.
- Build submit request payloads.

#### AdminFiltersState

Owns current-year filters.

```ts
type AdminFiltersState = {
  query: string;
  withAllergiesOnly: boolean;
  age?: number;
  registrationStatus?: RegistrationStatus;
};
```

Responsibilities:

- Hold current filter values.
- Convert filters to API query parameters.
- Reset filters.

### Client Services

Keep services small and endpoint-oriented.

#### PublicContentApi

Used by landing page.

- `getActivePublicHome(): Observable<PublicHomeView>`

#### ParentLookupApi

Used by parent lookup and my registrations.

- `findByPhone(phone: PhoneNumber): Observable<ParentRegistrationsView | null>`
- `getRegistrationStatus(registrationId: ID): Observable<RegistrationStatusView>`

#### RegistrationApi

Used by registration wizard.

- `createDraft(request: CreateRegistrationDraftRequest): Observable<RegistrationDraftResponse>`
- `saveDetails(groupId: ID, request: SaveRegistrationDetailsRequest): Observable<RegistrationDraftResponse>`
- `signContract(groupId: ID, request: SignContractRequest): Observable<RegistrationDraftResponse>`
- `uploadDocument(groupId: ID, request: UploadDocumentRequest): Observable<DocumentSubmission>`
- `submit(groupId: ID): Observable<RegistrationStatusView[]>`

#### AdminSchoolYearApi

Used by admin years and create/edit year.

- `listYears(): Observable<SchoolYear[]>`
- `getYear(yearId: ID): Observable<SchoolYearDetailView>`
- `createYear(request: SaveSchoolYearRequest): Observable<SchoolYear>`
- `duplicateYear(yearId: ID): Observable<SchoolYear>`
- `updateYear(yearId: ID, request: SaveSchoolYearRequest): Observable<SchoolYear>`
- `publishYear(yearId: ID): Observable<SchoolYear>`

#### AdminRegistrationApi

Used by admin home, current year, and registration detail.

- `getDashboard(yearId?: ID): Observable<AdminDashboardView>`
- `searchCurrentYear(filters: AdminFiltersState): Observable<AdminRegistrationListItem[]>`
- `getRegistrationGroup(groupId: ID): Observable<AdminRegistrationDetailView>`
- `approveDocument(submissionId: ID): Observable<DocumentSubmission>`
- `rejectDocument(submissionId: ID, reason: string): Observable<DocumentSubmission>`
- `saveInternalNote(submissionId: ID, note: string): Observable<DocumentSubmission>`
- `removeRegistration(registrationId: ID, reason: string): Observable<YearlyRegistration>`
- `restoreRegistration(registrationId: ID): Observable<YearlyRegistration>`

#### FileApi

Used for uploads/downloads.

- `upload(file: File, documentType: DocumentType): Observable<UploadedFile>`
- `downloadUrl(fileId: ID): Observable<{ url: string }>`

### Client Components Should Not

- Calculate final registration completion rules.
- Approve or reject by changing local status only.
- Decide whether a school year has capacity.
- Expose raw storage paths.
- Store medical/allergy values outside the registration flow or admin detail screen state.

## Server Stack Design

The server owns persistence, validation, file storage, and business rules.

The exact framework is not defined yet. The following services/classes should exist regardless of whether the backend is implemented with NestJS, Express, Fastify, or another simple Node server.

### Server Entities / Tables

Minimum persistence tables/collections:

- `parents`
- `children`
- `school_years`
- `plans`
- `registration_groups`
- `yearly_registrations`
- `contract_versions`
- `signed_contracts`
- `uploaded_files`
- `document_submissions`
- `admin_users`
- `audit_events`

Keep relationships explicit with IDs. Avoid embedded copies except for immutable generated files.

### Server Services

#### PublicContentService

Responsibilities:

- Load the active public school year.
- Load available plans.
- Hide public content when the active year is not visible.

Methods:

- `getActivePublicHome()`

#### ParentService

Responsibilities:

- Normalize phone numbers.
- Find or create parent by phone.
- Return parent registration summaries.

Methods:

- `findOrCreateParent(fullName, phone)`
- `findParentByPhone(phone)`
- `getParentRegistrationsByPhone(phone)`

#### ChildService

Responsibilities:

- Create children.
- Update child basic details.
- List children by parent.

Methods:

- `createChild(parentId, input)`
- `updateChild(childId, input)`
- `listByParent(parentId)`

#### RegistrationService

Responsibilities:

- Create registration groups.
- Create one yearly registration per child.
- Save parent/child details.
- Enforce one active yearly registration per child per school year.
- Enforce active year and open registration.
- Calculate registration status from stages.
- Remove/restore a yearly registration.

Methods:

- `createDraft(input)`
- `saveDetails(groupId, input)`
- `submit(groupId)`
- `getStatus(registrationId)`
- `recalculateStatus(registrationId)`
- `removeRegistration(registrationId, reason, adminId)`
- `restoreRegistration(registrationId, adminId)`

#### SchoolYearService

Responsibilities:

- Create, edit, duplicate, and publish school years.
- Manage active school year uniqueness.
- Manage capacity and public visibility.

Methods:

- `listYears()`
- `getYearDetail(yearId)`
- `createYear(input)`
- `duplicateYear(sourceYearId)`
- `updateYear(yearId, input)`
- `publishYear(yearId)`
- `getActiveYear()`
- `assertHasCapacity(yearId, requestedChildrenCount)`

#### PlanService

Responsibilities:

- Manage plans per school year.
- Validate selected plan availability.

Methods:

- `listPlans(yearId)`
- `savePlans(yearId, plans)`
- `assertPlanIsSelectable(planId, schoolYearId)`

#### ContractService

Responsibilities:

- Manage contract versions.
- Create signed contract records.
- Store signature file.
- Generate final signed contract file if supported in version 1.
- Mark covered registrations as contract done.

Methods:

- `createContractVersion(yearId, fileId, versionLabel)`
- `getActiveContractVersion(yearId)`
- `signContract(groupId, input)`
- `getSignedContractDownload(registrationId)`

#### DocumentService

Responsibilities:

- Create document submissions.
- Link one uploaded file to one or more registrations.
- Approve/reject standing order and insurance submissions.
- Apply approved/rejected status to all linked registrations.
- Store rejection reasons and internal notes.

Methods:

- `submitDocument(groupId, input)`
- `approveSubmission(submissionId, adminId)`
- `rejectSubmission(submissionId, adminId, reason)`
- `saveInternalNote(submissionId, adminId, note)`

#### FileStorageService

Responsibilities:

- Validate file type and size.
- Store files.
- Return short-lived download URLs.
- Never expose raw storage paths to the client.

Methods:

- `upload(file, metadata)`
- `getDownloadUrl(fileId, actor)`
- `assertActorCanAccessFile(fileId, actor)`

#### AdminDashboardService

Responsibilities:

- Build admin dashboard metrics.
- Build pending review cards.
- Search/filter current-year registrations.
- Build registration detail view.

Methods:

- `getDashboard(yearId?)`
- `searchCurrentYear(filters)`
- `getRegistrationGroupDetail(groupId)`

#### AuditService

Responsibilities:

- Write append-only audit events.
- Query audit history for a registration group.

Methods:

- `record(event)`
- `listForEntity(entityType, entityId)`

### Server Controllers / API Routes

Use REST for simplicity.

Public:

- `GET /api/public/home`

Parent:

- `POST /api/parents/lookup`
- `GET /api/parents/registrations/:registrationId/status`

Registration:

- `POST /api/registration/drafts`
- `PUT /api/registration/groups/:groupId/details`
- `POST /api/registration/groups/:groupId/sign-contract`
- `POST /api/registration/groups/:groupId/documents`
- `POST /api/registration/groups/:groupId/submit`

Files:

- `POST /api/files`
- `GET /api/files/:fileId/download-url`

Admin:

- `GET /api/admin/dashboard`
- `GET /api/admin/years`
- `POST /api/admin/years`
- `GET /api/admin/years/:yearId`
- `POST /api/admin/years/:yearId/duplicate`
- `PUT /api/admin/years/:yearId`
- `POST /api/admin/years/:yearId/publish`
- `GET /api/admin/current-year/registrations`
- `GET /api/admin/registration-groups/:groupId`
- `POST /api/admin/document-submissions/:submissionId/approve`
- `POST /api/admin/document-submissions/:submissionId/reject`
- `PUT /api/admin/document-submissions/:submissionId/internal-note`
- `POST /api/admin/registrations/:registrationId/remove`
- `POST /api/admin/registrations/:registrationId/restore`

## Request / Response Shapes

### CreateRegistrationDraftRequest

```ts
type CreateRegistrationDraftRequest = {
  schoolYearId: ID;
  parent: {
    fullName: string;
    phone: PhoneNumber;
  };
  children: Array<{
    fullName: string;
    birthDate: ISODate;
    allergyAnswer: AllergyAnswer;
    allergyDetails?: string;
    planId: ID;
  }>;
};
```

### SaveRegistrationDetailsRequest

```ts
type SaveRegistrationDetailsRequest = CreateRegistrationDraftRequest;
```

### SignContractRequest

```ts
type SignContractRequest = {
  registrationIds: ID[];
  signerName: string;
  signatureDataUrl: string;
};
```

### UploadDocumentRequest

```ts
type UploadDocumentRequest = {
  documentType: 'standing_order' | 'insurance_receipt';
  fileId: ID;
  registrationIds: ID[];
};
```

### SaveSchoolYearRequest

```ts
type SaveSchoolYearRequest = {
  name: string;
  startsOn: ISODate;
  endsOn: ISODate;
  status: SchoolYearStatus;
  registrationOpen: boolean;
  publicVisible: boolean;
  capacity: number;
  insuranceAmount: MoneyAmount;
  proceduresText: string;
  parentInstructionsText: string;
  plans: Array<{
    id?: ID;
    name: string;
    description: string;
    daysAndHours: string;
    price: MoneyAmount;
    paymentTerms?: string;
    availability: PlanAvailability;
    sortOrder: number;
  }>;
  contractFileId?: ID;
};
```

## Business Rules Owned By Server

- Parent lookup uses normalized phone number.
- A parent can have many children.
- A child can have one yearly registration per school year.
- Registration cannot start unless the selected school year is active/open and the plan is available.
- Registration cannot exceed school year capacity.
- Allergies are registration-year data, not global child data.
- Contract status becomes done only after digital signature is saved.
- Standing order and insurance are never auto-approved after upload.
- Document approval/rejection applies to every linked registration ID.
- Overall registration status is completed only when:
  - details are done.
  - contract is done.
  - standing order is approved.
  - insurance is approved.
- Removing a registration is logical and year-specific.
- Files are downloadable only by an authorized admin or by the parent phone associated with the registration.
- Admin review actions must create audit events.

## Validation Rules

Minimum version 1 validation:

- Parent full name is required.
- Parent phone is required and must match an Israeli mobile number format after normalization.
- Child full name is required.
- Child birth date is required.
- Plan ID is required.
- Allergy answer is required.
- Allergy details are required only when allergy answer is `yes`.
- Signer name is required before signing.
- Signature data is required before signing.
- Upload file must be PDF or image.
- Rejection reason is required when rejecting a document.
- Capacity must be a positive integer.
- Insurance amount must be zero or greater.
- Plan price must be zero or greater.

## Suggested Implementation Order

1. Create shared TypeScript model files in the client.
2. Add backend project skeleton and persistence layer.
3. Implement school year and plan APIs.
4. Replace landing page mock data with `GET /api/public/home`.
5. Implement parent lookup and my registrations read models.
6. Implement registration draft creation and details saving.
7. Implement file upload and document submission.
8. Implement contract signing.
9. Implement admin dashboard/current-year read models.
10. Implement admin approve/reject and status recalculation.
11. Implement remove/restore registration.

## Version 1 Deliberate Simplifications

- No parent passwords.
- No OTP unless added later.
- No payments integration.
- No automatic WhatsApp/SMS/email notifications.
- No complex roles beyond one admin.
- No hard delete of children, registrations, contracts, or files.
- No global medical profile; allergies are stored per yearly registration.
- No event-sourcing beyond a simple audit log.
- No separate reporting module; dashboard read models are enough.
