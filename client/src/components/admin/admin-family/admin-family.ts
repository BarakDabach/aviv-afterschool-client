import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-family',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './admin-family.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFamily {}
