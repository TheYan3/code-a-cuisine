import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Keeps the results page from being opened without recipes to show, sending
 * the visitor back to the ingredients step instead — a bare `/generator/results`
 * has nothing to render.
 */
export const hasRecipeIdsGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  return !!route.queryParamMap.get('ids') || router.parseUrl('/generator');
};
