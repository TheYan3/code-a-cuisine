import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { cuisineMeta } from './cuisine-meta';

/**
 * Blocks `/library/:cuisine` for a key that is not one of the six known
 * cuisines, redirecting to the library overview instead — a typo'd or stale
 * link should never land on a page with no cuisine to show.
 */
export const knownCuisineGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const cuisine = route.paramMap.get('cuisine');

  return (cuisine && cuisineMeta(cuisine)) != null || router.parseUrl('/library');
};
