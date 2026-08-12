import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideTrash2, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';

type ChildRegistration = {
  id: number;
  name: string;
  birthDate: string;
  allergyAnswer: string;
};

@Component({
  selector: 'app-child-details-stage',
  imports: [FormsModule, NgIcon, HlmButtonImports, HlmInputImports, HlmRadioGroupImports],
  providers: [provideIcons({ lucidePlus, lucideTrash2, lucideUserRound })],
  templateUrl: './child-details-stage.html',
  styleUrl: '../stage-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChildDetailsStage {
  protected children: ChildRegistration[] = [this.createChild(1)];
  private nextChildId = 2;

  protected addChild(): void {
    this.children = [...this.children, this.createChild(this.nextChildId)];
    this.nextChildId += 1;
  }

  protected removeChild(childId: number): void {
    const nextChildren = this.children.filter((child) => child.id !== childId);
    this.children = nextChildren.length > 0 ? nextChildren : [this.createChild(this.nextChildId++)];
  }

  protected childDisplayName(child: ChildRegistration, index: number): string {
    return child.name.trim() || `ילד ${index + 1}`;
  }

  private createChild(id: number): ChildRegistration {
    return {
      id,
      name: '',
      birthDate: '',
      allergyAnswer: 'no',
    };
  }
}
