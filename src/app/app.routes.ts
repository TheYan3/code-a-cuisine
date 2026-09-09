import { Routes } from '@angular/router';

import { Generator } from './pages/generator/generator';
import { Imprint } from './pages/imprint/imprint';
import { Library } from './pages/library/library';
import { RecipeDetail } from './pages/recipe-detail/recipe-detail';

/**
 * Application routes. Only four pages exist, so lazy loading would add
 * complexity without a real benefit here — all pages are loaded eagerly.
 */
export const routes: Routes = [
  { path: '', component: Generator },
  { path: 'library', component: Library },
  { path: 'recipe/:id', component: RecipeDetail },
  { path: 'imprint', component: Imprint },
  { path: '**', redirectTo: '' },
];
