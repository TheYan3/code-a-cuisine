import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { Pagination } from '../../components/pagination/pagination';
import { cuisineMeta } from '../../core/cuisine-meta';
import { MOCK_RECIPES } from '../../core/mock-recipes';
import { Recipe } from '../../core/recipe';

/** Recipes shown per page, matching the Figma list ("page 2 starts at 21"). */
const PAGE_SIZE = 20;

/**
 * One cuisine's recipe list (`/library/:cuisine`), reached from a cookbook
 * tile: the cuisine banner, a numbered list of its recipes with pagination,
 * and the empty state for a cuisine that has none yet.
 *
 * An unknown `:cuisine` key is not redirected here — `meta()` is simply
 * `undefined` and the page shows the empty state. Phase C adds the redirect
 * to `/library`.
 */
@Component({
  imports: [Header, Pagination, RouterLink],
  selector: 'app-cuisine',
  styleUrl: './cuisine.scss',
  templateUrl: './cuisine.html',
})
export class CuisinePage {
  /** Cuisine key, bound from the `:cuisine` route parameter. */
  readonly cuisine = input<string>('');
  /** 1-based page number, bound from `?page=`. */
  readonly page = input<string>('1');

  /** Display data (label, emoji, banner) for the current cuisine key. */
  protected readonly meta = computed(() => cuisineMeta(this.cuisine()));

  // ponytail: mock data, wired to RecipeApi in phase C — replace this list
  // with `api.list()` filtered by `cuisine()`, keep the paging computeds.
  private readonly allRecipes: Recipe[] = MOCK_RECIPES;

  /** Every recipe of the current cuisine, oldest-first id order for stable paging. */
  protected readonly recipes = computed(() =>
    this.allRecipes.filter((recipe) => recipe.cuisine === this.cuisine()),
  );

  /** Current page, clamped to at least 1. */
  protected readonly currentPage = computed(() => Math.max(1, Number(this.page()) || 1));

  /** Number of pages this cuisine's recipes need at 20 per page. */
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.recipes().length / PAGE_SIZE)),
  );

  /** The 20 (at most) recipes shown on the current page. */
  protected readonly pageRecipes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.recipes().slice(start, start + PAGE_SIZE);
  });

  /** List start number for `<ol start>`, so page 2 continues at 21. */
  protected readonly startNumber = computed(() => (this.currentPage() - 1) * PAGE_SIZE + 1);

  /**
   * Diet and time-category tags for one recipe. "No preference" is left out
   * — it says nothing, same rule as the recipe detail page.
   */
  protected tags(recipe: Recipe): string[] {
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const tags: string[] = [];
    if (recipe.diet !== 'no-preference') tags.push(capitalize(recipe.diet));
    tags.push(capitalize(recipe.timeCategory));
    return tags;
  }
}
