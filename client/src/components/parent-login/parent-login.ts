import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCheck, lucideChevronLeft, lucideShieldCheck, lucideUserRound } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-parent-login',
  imports: [NgIcon, RouterLink, HlmButtonImports, HlmInputImports],
  providers: [provideIcons({ lucideArrowLeft, lucideCheck, lucideChevronLeft, lucideShieldCheck, lucideUserRound })],
  templateUrl: './parent-login.html',
  styleUrl: './parent-login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentLogin {}
