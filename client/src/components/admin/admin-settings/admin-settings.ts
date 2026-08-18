import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-settings',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './admin-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettings {}
