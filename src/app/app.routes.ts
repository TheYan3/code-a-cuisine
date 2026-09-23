import { Routes } from '@angular/router';

import { canGenerateGuard } from './core/can-generate.guard';
import { hasIngredientsGuard } from './core/has-ingredients.guard';
import { hasRecipeIdsGuard } from './core/has-recipe-ids.guard';
import { Generator } from './pages/generator/generator';
import { Home } from './pages/home/home';
import { Imprint } from './pages/imprint/imprint';
import { Library } from './pages/library/library';
import { Loading } from './pages/loading/loading';
import { Preferences } from './pages/preferences/preferences';
import { RecipeDetail } from './pages/recipe-detail/recipe-detail';
import { Results } from './pages/results/results';

/**
 * Application routes. Only eight pages exist, so lazy loading would add
 * complexity without a real benefit here — all pages are loaded eagerly.
 *
 * The three generator steps guard each other so none of them can be opened
 * out of order: `preferences` needs an ingredient, `results` needs recipe
 * ids in the query string, and `loading` needs a complete request plus the
 * one-shot permission from the "Generate a recipe" press — it spends quota
 * the moment it opens.
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'generator', component: Generator },
  { path: 'generator/preferences', component: Preferences, canActivate: [hasIngredientsGuard] },
  { path: 'generator/loading', component: Loading, canActivate: [canGenerateGuard] },
  { path: 'generator/results', component: Results, canActivate: [hasRecipeIdsGuard] },
  { path: 'library', component: Library },
  { path: 'recipe/:id', component: RecipeDetail },
  { path: 'imprint', component: Imprint },
  { path: '**', redirectTo: '' },
];
