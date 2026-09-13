import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RecipeRequestService } from './recipe-request';

/**
 * Blocks navigation to the preferences step until at least one ingredient
 * has been added, redirecting back to the ingredients step instead — a
 * fresh tab (empty sessionStorage) or a stale link should never land on an
 * empty preferences page.
 */
export const hasIngredientsGuard: CanActivateFn = () => {
  const recipeRequest = inject(RecipeRequestService);
  const router = inject(Router);

  return recipeRequest.ingredients().length > 0 || router.parseUrl('/generator');
};
