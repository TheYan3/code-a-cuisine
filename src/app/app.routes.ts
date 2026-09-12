import { Routes } from '@angular/router';

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
 * `generator/preferences` has no guard yet redirecting back when there are
 * no ingredients — that is added together with the shared recipe request
 * state in the next pass.
 */
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'generator', component: Generator },
  { path: 'generator/preferences', component: Preferences },
  { path: 'library', component: Library },
  { path: 'recipe/:id', component: RecipeDetail },
  { path: 'imprint', component: Imprint },
  { path: '**', redirectTo: '' },
];
