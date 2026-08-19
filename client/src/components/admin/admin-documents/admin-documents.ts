import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-admin-documents',
  imports: [RouterLink, HlmButtonImports],
  templateUrl: './admin-documents.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDocuments {}
