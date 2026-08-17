import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationDocumentScopeKind } from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';
import { DocumentsStage } from './documents-stage';

describe('DocumentsStage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('hides the standing-order upload section for a daily plan', async () => {
    const fixture = await renderDocumentsStage([
      dailyPlan(),
    ]);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain('אישור הוראת קבע');
    expect(compiled.textContent).not.toContain('הוראת קבע -');
  });

  it('shows the standing-order upload section when any plan requires it', async () => {
    const fixture = await renderDocumentsStage([
      monthlyPlan(),
    ]);

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('אישור הוראת קבע');
    expect(compiled.textContent).toContain('העלאת אישור משותף');
  });
});

async function renderDocumentsStage(availableYearPlans: Array<{ yearPlanId: number; plan: { id: number; name: string; price: number; hours: string; isActive: boolean; requiresStandingOrder: boolean } }>): Promise<ComponentFixture<DocumentsStage>> {
  const store = {
    children: signal([
      {
        id: 1,
        fullName: 'נועה לוי',
      },
    ]),
    contractScope: signal(RegistrationDocumentScopeKind.AllChildren),
    standingOrderScope: signal(RegistrationDocumentScopeKind.AllChildren),
    requiresStandingOrderDocuments: signal(availableYearPlans.some((yearPlan) => yearPlan.plan.requiresStandingOrder)),
    sharedScope: vi.fn(() => ({ kind: RegistrationDocumentScopeKind.AllChildren })),
    childScope: vi.fn((childId: number) => ({ kind: RegistrationDocumentScopeKind.SpecificChild, localChildId: childId })),
    documentFileName: vi.fn(() => ''),
    setDocumentScope: vi.fn(),
    selectDocumentFile: vi.fn(),
    year: signal({ id: 1, yearNumber: 2027 }),
    availableYearPlans: signal(availableYearPlans),
  };

  await TestBed.configureTestingModule({
    imports: [DocumentsStage],
    providers: [
      {
        provide: RegistrationStore,
        useValue: store,
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DocumentsStage);
  fixture.detectChanges();
  await settle();
  fixture.detectChanges();

  return fixture;
}

function dailyPlan() {
  return {
    yearPlanId: 102,
    plan: {
      id: 2,
      name: 'מסלול יומי',
      price: 1050,
      hours: 'שלושה ימים לבחירה עד 16:30',
      isActive: true,
      requiresStandingOrder: false,
    },
  };
}

function monthlyPlan() {
  return {
    yearPlanId: 101,
    plan: {
      id: 1,
      name: 'מסלול חודשי מלא',
      price: 1450,
      hours: 'ימים א-ה עד 16:30',
      isActive: true,
      requiresStandingOrder: true,
    },
  };
}

async function settle(): Promise<void> {
  for (let index = 0; index < 10; index += 1) {
    await Promise.resolve();
  }
}
