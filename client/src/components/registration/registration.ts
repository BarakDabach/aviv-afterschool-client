import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCheck, lucideChevronLeft } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AgreementsStage } from './stages/agreements-stage/agreements-stage';
import { ChildDetailsStage } from './stages/child-details-stage/child-details-stage';
import { DocumentsStage } from './stages/documents-stage/documents-stage';
import { ParentDetailsStage } from './stages/parent-details-stage/parent-details-stage';
import { PlanStage } from './stages/plan-stage/plan-stage';
import { SummaryStage } from './stages/summary-stage/summary-stage';

type RegistrationStep = {
  label: string;
};

@Component({
  selector: 'app-registration',
  imports: [
    NgIcon,
    RouterLink,
    HlmButtonImports,
    ParentDetailsStage,
    ChildDetailsStage,
    PlanStage,
    AgreementsStage,
    DocumentsStage,
    SummaryStage,
  ],
  providers: [provideIcons({ lucideArrowLeft, lucideCheck, lucideChevronLeft })],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Registration {
  protected activeStep = 0;

  protected readonly steps: RegistrationStep[] = [
    { label: 'הורה' },
    { label: 'ילדים' },
    { label: 'אישורים' },
    { label: 'סיום' },
  ];

  protected get backLabel(): string {
    if (this.activeStep === 0) return 'חזרה';
    if (this.activeStep === this.steps.length - 1) return 'יציאה';
    return `חזרה ל${this.steps[this.activeStep - 1].label}`;
  }

  protected get primaryLabel(): string {
    return [
      'המשך לפרטי הילד',
      'המשך למסלול ואישורים',
      'שליחת ההרשמה',
      'חזרה לעמוד הראשי',
    ][this.activeStep];
  }

  protected get primaryDisabled(): boolean {
    return false;
  }

  protected get stepTitle(): string {
    return ['פרטי ההורה', 'פרטי הילדים', 'מסלול ואישורים', 'ההרשמה נשלחה'][this.activeStep];
  }

  protected get stepDescription(): string {
    return [
      'הזינו את פרטי ההורה שישמש כאיש הקשר הראשי להרשמה.',
      'מלאו את פרטי הילדים. אפשר להוסיף ילד נוסף לפני שממשיכים למסלול.',
      'בחרו מסלול, עברו על החוזה והעלו את המסמכים באותו שלב.',
      'ההרשמה התקבלה ותמתין לבדיקה של אביב.',
    ][this.activeStep];
  }

  protected goBack(): void {
    if (this.activeStep > 0) {
      this.setActiveStep(this.activeStep - 1);
    }
  }

  protected goNext(): void {
    if (this.primaryDisabled) return;
    this.setActiveStep(Math.min(this.steps.length - 1, this.activeStep + 1));
  }

  protected setActiveStep(step: number): void {
    if (step === this.activeStep) return;
    this.activeStep = Math.min(Math.max(step, 0), this.steps.length - 1);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  }
}
