import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { AdminYearForm } from './admin-year-form';
import { AdminYearsDesktop } from './admin-years-desktop';
import { AdminYearsMobile } from './admin-years-mobile';
import { AdminYearsStore, type AdminYearFormMode } from './admin-years.store';

@Component({
  selector: 'app-admin-years',
  imports: [
    AdminYearsDesktop,
    AdminYearsMobile,
    AdminYearForm,
    NgIcon,
    HlmButtonImports,
    HlmDialogImports,
    HlmEmptyImports,
    HlmSpinnerImports,
  ],
  providers: [
    AdminYearsStore,
    provideIcons({ lucideCircleAlert, lucideRefreshCw }),
  ],
  templateUrl: './admin-years.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminYears {
  protected readonly store = inject(AdminYearsStore);

  protected openYearForm(mode: AdminYearFormMode): void {
    this.store.openYearForm(mode);
  }

  protected closeYearForm(): void {
    this.store.closeYearForm();
  }
}
