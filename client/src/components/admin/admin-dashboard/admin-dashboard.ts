import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideClock3,
  lucideFileText,
  lucideFolderOpen,
  lucideUserRound,
  lucideUsersRound,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';

type AdminStageState = 'done' | 'pending' | 'empty';

@Component({
  selector: 'app-admin-dashboard',
  imports: [NgClass, NgIcon, RouterLink, HlmButtonImports],
  providers: [
    provideIcons({
      lucideCircleCheck,
      lucideClock3,
      lucideFileText,
      lucideFolderOpen,
      lucideUserRound,
      lucideUsersRound,
    }),
  ],
  templateUrl: './admin-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard {
  protected readonly metrics = [
    { value: '24', label: 'ילדים', icon: 'lucideUsersRound', tone: 'success' },
    { value: '30', label: 'תפוסה', icon: 'lucideUsersRound', tone: 'success' },
    { value: '18', label: 'הושלמו', icon: 'lucideCircleCheck', tone: 'success' },
    { value: '6', label: 'ממתינים', icon: 'lucideClock3', tone: 'warning' },
  ];

  protected readonly registrations: Array<{
    title: string;
    icon: string;
    tags: Array<{ label: string; icon: string }>;
    stages: Array<{ label: string; state: AdminStageState }>;
    compact?: boolean;
  }> = [
    {
      title: 'נועה לוי ואורי לוי',
      icon: 'lucideUsersRound',
      tags: [
        { label: '2 ילדים', icon: 'lucideUsersRound' },
        { label: 'מסמכים משותפים', icon: 'lucideFolderOpen' },
      ],
      stages: [
        { label: 'פרטים', state: 'done' },
        { label: 'חוזה', state: 'done' },
        { label: 'הוראת קבע', state: 'pending' },
        { label: 'ביטוח', state: 'pending' },
      ],
    },
    {
      title: 'תמר ישראלי',
      icon: 'lucideUserRound',
      tags: [{ label: 'ילד אחד', icon: 'lucideUsersRound' }],
      stages: [
        { label: 'פרטים', state: 'done' },
        { label: 'חוזה', state: 'done' },
        { label: 'הוראת קבע', state: 'done' },
        { label: 'ביטוח', state: 'pending' },
      ],
    },
    {
      title: 'יואב מזרחי',
      icon: 'lucideUserRound',
      tags: [],
      stages: [
        { label: 'פרטים', state: 'done' },
        { label: 'חוזה', state: 'pending' },
        { label: 'הוראת קבע', state: 'empty' },
        { label: 'ביטוח', state: 'empty' },
      ],
      compact: true,
    },
  ];

}
