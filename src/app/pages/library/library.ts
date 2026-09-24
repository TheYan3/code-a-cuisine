import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { CUISINES } from '../../core/cuisine-meta';
import { MOCK_RECIPES } from '../../core/mock-recipes';
import { Recipe } from '../../core/recipe';

/** Cards shown in the "Most liked recipes" strip, at most. */
const MAX_MOST_LIKED = 10;

/**
 * Library page: the public overview of every generated recipe, grouped into
 * the "Most liked recipes" strip and the six cuisine tiles that link to
 * `/library/:cuisine`.
 */
@Component({
  imports: [Header, RouterLink],
  selector: 'app-library',
  styleUrl: './library.scss',
  templateUrl: './library.html',
})
export class Library {
  // ponytail: mock data, wired to RecipeApi in phase C — replace this field
  // with `api.list()` and keep `mostLiked`/`cuisines` as they are.
  protected readonly recipes: Recipe[] = MOCK_RECIPES;

  /** The most-liked recipes across every cuisine, highest like count first. */
  protected readonly mostLiked: Recipe[] = [...this.recipes]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, MAX_MOST_LIKED);

  /** The six cuisine tiles, in the Figma order. */
  protected readonly cuisines = CUISINES;
}
