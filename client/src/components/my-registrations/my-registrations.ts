import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCheck,
  lucideChevronLeft,
  lucideClock3,
  lucideUserRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

type ParentRegistration = {
  childName: string;
  plan: string;
  year: string;
  status: 'pending' | 'complete';
  statusLabel: string;
  note: string;
  actionLabel: string;
  actionVariant: 'link' | 'outline';
};

@Component({
  selector: 'app-my-registrations',
  imports: [NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideCheck,
      lucideChevronLeft,
      lucideClock3,
      lucideUserRound,
    }),
  ],
  templateUrl: './my-registrations.html',
  styleUrl: './my-registrations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRegistrations {
  protected readonly registrations: ParentRegistration[] = [
    {
      childName: 'נועה לוי',
      plan: 'מסלול מלא',
      year: 'שנת תשפ״ז',
      status: 'pending',
      statusLabel: 'ממתינה לבדיקה',
      note: 'נותר להעלות אסמכתה לתשלום הביטוח',
      actionLabel: 'המשך הרשמה',
      actionVariant: 'link',
    },
    {
      childName: 'אורי לוי',
      plan: 'שלושה ימים',
      year: 'שנת תשפ״ז',
      status: 'complete',
      statusLabel: 'הושלם',
      note: 'ההרשמה הושלמה ואושרה',
      actionLabel: 'צפייה בסטטוס',
      actionVariant: 'outline',
    },
  ];
}
