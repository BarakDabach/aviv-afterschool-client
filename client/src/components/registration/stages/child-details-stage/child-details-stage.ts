import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { RegistrationChildDraft } from '../../../../app/types/registration-status.type';
import { RegistrationStore } from '../../registration.store';

@Component({
  selector: 'app-child-details-stage',
  imports: [FormsModule, NgIcon, NgClass, HlmButtonImports, HlmInputImports, HlmRadioGroupImports],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideUserRound })],
  templateUrl: './child-details-stage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildDetailsStage {
  protected readonly store = inject(RegistrationStore);

  protected addChild(): void {
    this.store.addChild();
  }

  protected removeChild(childId: number): void {
    this.store.removeChild(childId);
  }

  protected updateChildName(childId: number, name: string): void {
    this.store.updateChild(childId, { name });
  }

  protected updateChildBirthDate(childId: number, birthDate: string): void {
    this.store.updateChild(childId, { birthDate });
  }

  protected updateChildAllergyAnswer(childId: number, allergyAnswer: string): void {
    this.store.updateChild(childId, { allergyAnswer });
  }

  protected childDisplayName(child: RegistrationChildDraft, index: number): string {
    return child.name.trim() || `ילד ${index + 1}`;
  }
}
