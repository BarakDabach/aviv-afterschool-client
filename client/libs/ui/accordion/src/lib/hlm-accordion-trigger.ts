import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronUp } from '@ng-icons/lucide';
import { BrnAccordionImports } from '@spartan-ng/brain/accordion';
import { hlm } from '@spartan-ng/helm/utils';
import type { ClassValue } from 'clsx';

@Component({
  selector: 'hlm-accordion-trigger',
  imports: [BrnAccordionImports, NgIcon],
  providers: [provideIcons({ lucideChevronDown, lucideChevronUp })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    [data-slot='accordion-trigger-icon-up'] {
      display: none;
    }

    button[aria-expanded='true'] [data-slot='accordion-trigger-icon-down'] {
      display: none;
    }

    button[aria-expanded='true'] [data-slot='accordion-trigger-icon-up'] {
      display: inline-flex;
    }
  `],
  template: `
    <h3 brnAccordionHeader class="flex">
      <button brnAccordionTrigger data-slot="accordion-trigger" [class]="_computedTriggerClass()">
        <ng-content />
        <ng-icon
          name="lucideChevronDown"
          data-slot="accordion-trigger-icon-down"
          class="pointer-events-none shrink-0"
        />
        <ng-icon
          name="lucideChevronUp"
          data-slot="accordion-trigger-icon-up"
          class="pointer-events-none shrink-0"
        />
      </button>
    </h3>
  `,
})
export class HlmAccordionTrigger {
  public readonly triggerClass = input<ClassValue>('');

  protected readonly _computedTriggerClass = computed(() =>
    hlm(
      '**:data-[slot=accordion-trigger-icon-down]:ms-auto **:data-[slot=accordion-trigger-icon-up]:ms-auto **:data-[slot=accordion-trigger-icon-down]:h-4 **:data-[slot=accordion-trigger-icon-up]:h-4 **:data-[slot=accordion-trigger-icon-down]:w-4 **:data-[slot=accordion-trigger-icon-up]:w-4 **:data-[slot=accordion-trigger-icon-down]:text-muted-foreground! **:data-[slot=accordion-trigger-icon-up]:text-muted-foreground! gap-6 overflow-visible p-4 text-start text-sm font-medium hover:underline group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none aria-disabled:pointer-events-none aria-disabled:opacity-50',
      this.triggerClass(),
    ),
  );
}
