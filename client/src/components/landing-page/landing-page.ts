import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarDays,
  lucideCheck,
  lucideClock3,
  lucidePuzzle,
  lucideShieldCheck,
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
  priceMeta: string;
};

@Component({
  selector: 'app-landing-page',
  imports: [NgIcon, RouterLink, HlmButtonImports, HlmAccordionImports, SelectionCard],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCalendarDays,
      lucideCheck,
      lucideClock3,
      lucidePuzzle,
      lucideShieldCheck,
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
    { icon: 'lucideCalendarDays', label: 'גן ובית ספר' },
    { icon: 'lucideClock3', label: 'עד 17:00' },
  ];

  protected readonly benefits = [
    {
      icon: 'lucideUsers',
      title: 'מסגרת פרטית וייחודית',
      description: 'בית אחר הצהריים לילדי גן ובית ספר יחד, בניהול אישי של אביב כהן.',
    },
    {
      icon: 'lucideShieldCheck',
      title: 'בריאות, תנועה וספורט',
      description: 'פעילויות ספורט ותנועה שנלמדות לעומק, עם הרחבה בקייטנות בחופשות.',
    },
    {
      icon: 'lucidePuzzle',
      title: 'ערכים חברתיים',
      description: 'דגש על התנהגות נעימה, יחס מכבד וחברות טובה בין הילדים.',
    },
  ];

  protected readonly plans: Plan[] = [
    {
      name: '4-5 פעמים בשבוע',
      description: '13:00-17:00',
      price: '₪1,350',
      priceMeta: 'לחודש',
    },
    {
      name: '3 פעמים בשבוע',
      description: '13:00-17:00',
      price: '₪1,050',
      priceMeta: 'לחודש',
    },
    {
      name: '2 פעמים בשבוע',
      description: '13:00-17:00',
      price: '₪850',
      priceMeta: 'לחודש',
    },
    {
      name: 'חד פעמי',
      description: '13:00-17:00',
      price: '₪100',
      priceMeta: 'ליום',
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
      title: 'שעות פעילות ואיסוף',
      content: 'הבית פעיל בימים א-ה מרגע האיסוף ועד 17:00. ילדי בית ספר נאספים גם לאחר חוגים, ויש לעדכן בכל שינוי בשעת האיסוף.',
    },
    {
      title: 'חופשות וימי שביתה',
      content: 'בימי שביתה הבית נפתח כרגיל מ-12:30, או מהבוקר לפי הסכמת רוב ההורים ובתוספת 100 ש"ח ליום. בחופשות מתקיימות קייטנות בוקר עם פעילות ספורט מורחבת.',
    },
    {
      title: 'תשלומים',
      content: 'דמי הרשמה בסך 300 ש"ח מקוזזים מהתשלום הראשון. דמי ביטוח חד פעמיים: 200 ש"ח לשנה בבייבוקס או ביט. תשלום חודשי מתבצע בהוראת קבע מספטמבר עד יוני.',
    },
    {
      title: 'ביטול ושינויים',
      content: 'יש להודיע על שינוי בתדירות ההגעה. ביטול צהרון אפשרי בהודעה של 30 ימים מראש ועד חודש אפריל בלבד.',
    },
  ];

  protected setQuestionOpen(index: number, isOpened: boolean): void {
    this.openedQuestionIndex = isOpened ? index : null;
  }
}
