import { Directive, ElementRef, inject } from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'button',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

@Directive({
  selector: '[appFocusNextOnEnter]',
  host: {
    '(keydown.enter)': 'focusNext($event)',
  },
})
export class FocusNextOnEnterDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected focusNext(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.shiftKey || event.isComposing) {
      return;
    }

    const current = event.target;

    if (!(current instanceof HTMLElement) || current.tagName.toLowerCase() === 'textarea') {
      return;
    }

    const scope = current.closest('[data-focus-scope]') ?? this.elementRef.nativeElement.closest('[data-focus-scope]') ?? document.body;
    const controls = Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((control) => this.isFocusable(control));
    const currentIndex = controls.indexOf(current);
    const nextControl = controls.slice(currentIndex + 1).find((control) => this.isFocusable(control));

    event.preventDefault();

    if (nextControl) {
      nextControl.focus();
      return;
    }

    current.blur();
  }

  private isFocusable(control: HTMLElement): boolean {
    return (
      !control.hasAttribute('disabled') &&
      !control.hasAttribute('readonly') &&
      !control.hasAttribute('data-focus-next-skip') &&
      control.getAttribute('aria-hidden') !== 'true' &&
      control.tabIndex >= 0 &&
      control.getClientRects().length > 0
    );
  }
}
