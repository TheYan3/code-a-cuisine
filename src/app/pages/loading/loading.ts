import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Header } from '../../components/header/header';
import { RecipeApi, RecipeApiError } from '../../core/recipe-api';
import { RecipeRequestService } from '../../core/recipe-request';

/**
 * Full-screen loading state that actually runs the generation. Calls the n8n
 * webhook on init and hands over to the results page with the new recipe ids.
 *
 * The call is synchronous on purpose: n8n keeps the connection open until the
 * model answered, the reply was verified and the recipes were stored, so the
 * spinner runs exactly as long as the work takes.
 */
@Component({
  imports: [Header],
  selector: 'app-loading',
  styleUrl: './loading.scss',
  templateUrl: './loading.html',
})
export class Loading {
  private readonly api = inject(RecipeApi);
  private readonly recipeRequest = inject(RecipeRequestService);
  private readonly router = inject(Router);

  /** Error message to show instead of the spinner; `null` while generating. */
  protected readonly errorMessage = signal<string | null>(null);
  /** True when the daily quota caused the failure — the retry button is pointless then. */
  protected readonly outOfQuota = signal(false);

  constructor() {
    this.api.generate(this.recipeRequest.toRequest()).subscribe({
      next: (response) => {
        const ids = response.recipes.map((recipe) => recipe.id).join(',');
        this.router.navigate(['/generator/results'], { queryParams: { ids } });
      },
      error: (error: HttpErrorResponse) => this.showFailure(error),
    });
  }

  /** Sends the user back to adjust their ingredients and preferences. */
  protected onBack(): void {
    this.router.navigate(['/generator/preferences']);
  }

  /**
   * Turns a failed request into something readable. The webhook answers 429
   * when the daily quota is used up and 400 with concrete reasons when the
   * request does not pass revalidation; everything else is a network problem
   * or a broken generation, which the error workflow reports by mail.
   */
  private showFailure(error: HttpErrorResponse): void {
    const body = error.error as RecipeApiError | null;

    if (error.status === 429) {
      this.outOfQuota.set(true);
      this.errorMessage.set(
        body?.error ?? 'You used all recipe generations for today. Please try again tomorrow.',
      );
      return;
    }

    if (error.status === 400) {
      this.errorMessage.set(
        body?.details?.length
          ? `Please check your input: ${body.details.join(', ')}.`
          : 'Please check your ingredients and preferences.',
      );
      return;
    }

    this.errorMessage.set(
      error.status === 0
        ? 'We could not reach the kitchen. Please check your connection and try again.'
        : 'Something went wrong while cooking up your recipes. Please try again.',
    );
  }
}
