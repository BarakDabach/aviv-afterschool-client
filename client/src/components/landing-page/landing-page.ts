import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarDays,
  lucideChevronLeft,
  lucideCheck,
  lucideClock3,
  lucidePuzzle,
  lucideShieldCheck,
  lucideSprout,
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { SelectionCard } from '../shared/selection-card/selection-card';

type Plan = {
  name: string;
  description: string;
  price: string;
};

@Component({
  selector: 'app-landing-page',
  imports: [NgIcon, RouterLink, HlmButtonImports, HlmAccordionImports, SelectionCard],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCalendarDays,
      lucideChevronLeft,
      lucideCheck,
      lucideClock3,
      lucidePuzzle,
      lucideShieldCheck,
      lucideSprout,
      lucideUser,
      lucideUsers,
    }),
  ],
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  protected openedQuestionIndex: number | null = null;

  protected readonly heroFacts = [
    { icon: 'lucideCalendarDays', label: 'ימים א׳-ה׳' },
    { icon: 'lucideClock3', label: 'עד 16:30' },
    { icon: 'lucideSprout', label: 'שנת תשפ״ז' },
  ];

  protected readonly benefits = [
    {
      icon: 'lucideUsers',
      title: 'צוות חם ומקצועי',
      description: 'יחס אישי לילדים וליווי רגוע לאורך היום.',
    },
    {
      icon: 'lucideShieldCheck',
      title: 'סביבה בטוחה ונעימה',
      description: 'מרחב מוכר, מסודר ומלא תשומת לב.',
    },
    {
      icon: 'lucidePuzzle',
      title: 'זמן איכות, יצירה ומשחק',
      description: 'פעילויות מגוונות, חופשיות ומעשירות.',
    },
  ];

  protected readonly plans: Plan[] = [
    {
      name: 'מסלול מלא',
      description: 'א׳-ה׳ · עד 16:30',
      price: '₪1,450',
    },
    {
      name: 'שלושה ימים',
      description: 'ימים לבחירה · עד 16:30',
      price: '₪1,050',
    },
  ];

  protected readonly steps = [
    'בוחרים מסלול',
    'ממלאים פרטים',
    'מעלים חוזה חתום',
    'מעלים אישורים',
  ];

  protected readonly questions = [
    {
      title: 'נהלים והנחיות',
      content: 'הנהלים, שעות הפעילות והמסמכים הנדרשים יוצגו במהלך ההרשמה.',
    },
    {
      title: 'שאלות נפוצות',
      content: 'אפשר לעקוב אחרי סטטוס ההרשמה ולחזור להשלמות בכל שלב.',
    },
  ];

  protected setQuestionOpen(index: number, isOpened: boolean): void {
    this.openedQuestionIndex = isOpened ? index : null;
  }
}
