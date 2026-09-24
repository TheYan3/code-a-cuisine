import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { Pagination } from '../../components/pagination/pagination';
import { cuisineMeta } from '../../core/cuisine-meta';
import { Recipe } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/** Recipes shown per page, matching the Figma list ("page 2 starts at 21"). */
const PAGE_SIZE = 20;

/**
 * One cuisine's recipe list (`/library/:cuisine`), reached from a cookbook
 * tile: the cuisine banner, a numbered list of its recipes with pagination,
 * and the empty state for a cuisine that has none yet.
 *
 * An unknown `:cuisine` key never reaches this component — `knownCuisineGuard`
 * redirects to `/library` before it is created.
 */
@Component({
  imports: [Header, Pagination, RouterLink],
  selector: 'app-cuisine',
  styleUrl: './cuisine.scss',
  templateUrl: './cuisine.html',
})
export class CuisinePage implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Cuisine key, bound from the `:cuisine` route parameter. */
  readonly cuisine = input<string>('');
  /** 1-based page number, bound from `?page=`. */
  readonly page = input<string>('1');

  /** Display data (label, emoji, banner) for the current cuisine key. */
  protected readonly meta = computed(() => cuisineMeta(this.cuisine()));

  /** Every stored recipe, newest first. Empty while loading or on error. */
  protected readonly allRecipes = signal<Recipe[]>([]);
  /** True until the request settles, so the list does not flash "empty". */
  protected readonly loading = signal(true);
  /** True when the request failed. */
  protected readonly error = signal(false);

  /** This cuisine's recipes, newest first (the order `RecipeApi.list()` already returns). */
  protected readonly recipes = computed(() =>
    this.allRecipes().filter((recipe) => recipe.cuisine === this.cuisine()),
  );

  /** Number of pages this cuisine's recipes need at 20 per page. */
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.recipes().length / PAGE_SIZE)),
  );

  /**
   * Current page, clamped into `[1, totalPages()]` — a missing, non-numeric,
   * too-small or too-large `?page=` all fall back to the closest valid page
   * instead of an empty or broken list.
   */
  protected readonly currentPage = computed(() => {
    const requested = Math.max(1, Number(this.page()) || 1);
    return Math.min(requested, this.totalPages());
  });

  /** The 20 (at most) recipes shown on the current page. */
  protected readonly pageRecipes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.recipes().slice(start, start + PAGE_SIZE);
  });

  /** List start number for `<ol start>`, so page 2 continues at 21. */
  protected readonly startNumber = computed(() => (this.currentPage() - 1) * PAGE_SIZE + 1);

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (recipes) => {
        this.allRecipes.set(recipes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

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
