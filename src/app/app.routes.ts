import { Routes } from '@angular/router';

import { hasIngredientsGuard } from './core/has-ingredients.guard';
import { Generator } from './pages/generator/generator';
import { Home } from './pages/home/home';
import { Imprint } from './pages/imprint/imprint';
import { Library } from './pages/library/library';
import { Preferences } from './pages/preferences/preferences';
import { RecipeDetail } from './pages/recipe-detail/recipe-detail';

/**
 * Application routes. Only six pages exist, so lazy loading would add
 * complexity without a real benefit here — all pages are loaded eagerly.
 *
 * `generator/preferences` redirects back to `generator` when there are no
 * ingredients yet (see `hasIngredientsGuard`).
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'generator', component: Generator },
  { path: 'generator/preferences', component: Preferences, canActivate: [hasIngredientsGuard] },
  { path: 'library', component: Library },
  { path: 'recipe/:id', component: RecipeDetail },
  { path: 'imprint', component: Imprint },
  { path: '**', redirectTo: '' },
];
