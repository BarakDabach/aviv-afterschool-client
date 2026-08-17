import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DocumentType,
  Gender,
  RegistrationChildStatus,
  RegistrationDocumentScopeKind,
  RegistrationStatus,
  type RegistrationState,
} from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';
import { SummaryStage } from './summary-stage';

describe('SummaryStage', () => {
  let fixture: ComponentFixture<SummaryStage>;
  let registration = createRegistration(RegistrationStatus.WaitingForDocuments);
  let store: {
    submittedRegistration: ReturnType<typeof signal<RegistrationState | null>>;
    submittedDocumentsComplete: ReturnType<typeof signal<boolean>>;
    formattedSubmittedSubtotal: ReturnType<typeof signal<string>>;
    uploadMissingDocument: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    registration = createRegistration(RegistrationStatus.WaitingForDocuments);
    store = {
      submittedRegistration: signal<RegistrationState | null>(registration),
      submittedDocumentsComplete: signal(false),
      formattedSubmittedSubtotal: signal('₪1,450'),
      uploadMissingDocument: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SummaryStage],
      providers: [
        {
          provide: RegistrationStore,
          useValue: store,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryStage);
    fixture.detectChanges();
  });

  it('renders WaitingForDocuments with uploaded documents, missing documents, and upload controls', () => {
    const text = fixture.nativeElement.textContent as string;
    const missingUploadInputs = fixture.nativeElement.querySelectorAll('input[type="file"]');

    expect(text).toContain('נועה לוי');
    expect(text).toContain('אלרגיות ורגישויות: רגישות לחלב');
    expect(text).toContain('ממתינה למסמכים');
    expect(text).toContain('ההרשמה ממתינה להשלמת המסמכים החסרים');
    expect(text).toContain('מסמכים שהועלו');
    expect(text).toContain('contract.pdf');
    expect(text).toContain('מסמכים חסרים');
    expect(text).toContain('אישור הוראת קבע · נועה לוי');
    expect(text).toContain('לחצו להעלאת מסמך חסר');
    expect(missingUploadInputs).toHaveLength(1);
  });

  it('emits missing-document upload actions from missing rows', () => {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['mock'], 'standing-order.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    });
    input.dispatchEvent(new Event('change'));

    expect(store.uploadMissingDocument).toHaveBeenCalledWith(registration.missingDocuments[0], expect.any(Event));
  });

  it('renders PendingApproval without missing upload controls', () => {
    store.submittedRegistration.set(createRegistration(RegistrationStatus.PendingApproval));
    store.submittedDocumentsComplete.set(true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const missingUploadInputs = fixture.nativeElement.querySelectorAll('input[type="file"]');

    expect(text).toContain('ממתינה לאישור');
    expect(text).toContain('כל המסמכים התקבלו');
    expect(text).toContain('מסמכים שהועלו');
    expect(text).not.toContain('מסמכים חסרים');
    expect(text).not.toContain('לחצו להעלאת מסמך חסר');
    expect(missingUploadInputs).toHaveLength(0);
  });

  it('does not render an allergy line when the child has no allergy details', () => {
    const registrationWithoutAllergies = createRegistration(RegistrationStatus.PendingApproval);
    registrationWithoutAllergies.children[0] = {
      ...registrationWithoutAllergies.children[0],
      child: {
        ...registrationWithoutAllergies.children[0].child,
        allergies: null,
      },
    };
    store.submittedRegistration.set(registrationWithoutAllergies);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).not.toContain('אלרגיות ורגישויות');
    expect(text).not.toContain('ללא אלרגיות ורגישויות');
  });
});

function createRegistration(status: RegistrationStatus): RegistrationState {
  return {
    id: 1001,
    year: {
      id: 1,
      yearNumber: 2027,
    },
    status,
    parent: {
      id: 1,
      fullName: 'דנה לוי',
      phoneNumber: '0501234567',
      email: 'dana@example.com',
    },
    children: [
      {
        id: 1,
        child: {
          id: 1,
          fullName: 'נועה לוי',
          uniqueId: '',
          dateOfBirth: '2021-03-14',
          gender: Gender.Female,
          allergies: 'רגישות לחלב',
        },
        selectedPlan: {
          yearPlanId: 101,
          plan: {
            id: 1,
            name: 'מסלול חודשי מלא',
            price: 1450,
            hours: 'ימים א-ה עד 16:30',
            isActive: true,
            requiresStandingOrder: true,
          },
        },
        status: RegistrationChildStatus.Active,
        finalPrice: 1450,
      },
    ],
    documents: [
      {
        id: 1,
        fileName: 'contract.pdf',
        mimeType: 'application/pdf',
        documentType: DocumentType.SignedContract,
        scope: {
          kind: RegistrationDocumentScopeKind.SpecificChild,
          localChildId: 1,
        },
        uploadedAt: new Date().toISOString(),
      },
    ],
    missingDocuments: status === RegistrationStatus.WaitingForDocuments
      ? [
          {
            documentType: DocumentType.StandingOrderApproval,
            scope: {
              kind: RegistrationDocumentScopeKind.SpecificChild,
              localChildId: 1,
            },
            label: 'אישור הוראת קבע - נועה לוי',
          },
        ]
      : [],
  };
}
