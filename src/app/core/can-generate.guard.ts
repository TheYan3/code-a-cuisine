import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { RecipeRequestService } from './recipe-request';

/**
 * Guards the loading page, which starts a real generation the moment it is
 * created — and every generation costs one of the three daily slots.
 *
 * Passing needs two things: a complete request, and the one-shot permission
 * the preferences page hands out when "Generate a recipe" is pressed. The
 * permission is consumed here, so the page can never run twice for one
 * press: a reload finds it gone (it lives in memory only, unlike the request
 * itself, which is mirrored to sessionStorage), and navigating back from the
 * results finds it already used. Router navigation state would not do — the
 * router restores it from the history entry on a back navigation.
 */
export const canGenerateGuard: CanActivateFn = () => {
  const recipeRequest = inject(RecipeRequestService);
  const router = inject(Router);

  if (!recipeRequest.isComplete()) return router.parseUrl('/generator/preferences');

  return recipeRequest.consumeGeneration() || router.parseUrl('/generator/preferences');
};
