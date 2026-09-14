import { Component } from '@angular/core';

import { Header } from '../../components/header/header';

/**
 * Full-screen loading state shown while a recipe request is being generated.
 * Purely presentational for now — the n8n webhook call and the redirect to
 * the results page once it resolves are wired up in a later, separate task.
 */
@Component({
  imports: [Header],
  selector: 'app-loading',
  styleUrl: './loading.scss',
  templateUrl: './loading.html',
})
export class Loading {}
