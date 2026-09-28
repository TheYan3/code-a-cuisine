import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Header } from '../../components/header/header';
import { LikeButton } from '../../components/like-button/like-button';
import { cuisineMeta } from '../../core/cuisine-meta';
import { hasLiked, markLiked } from '../../core/liked-recipes';
import { Recipe, RecipeIngredient } from '../../core/recipe';
import { RecipeApi } from '../../core/recipe-api';

/** Chef badge image per cook, in the colors the Figma design defines. */
const CHEF_BADGES = [
  '/icons/Chef%201.svg',
  '/icons/Chef%202.svg',
  '/icons/chef%203.svg',
  '/icons/chef%204.svg',
];

/**
 * Full view of a single recipe, reached from the results page and from the
 * library. Loads the recipe by its `:id` route parameter, so the page works
 * as a shared link without any state from the generator.
 */
@Component({
  imports: [Header, RouterLink, LikeButton],
  selector: 'app-recipe-detail',
  styleUrl: './recipe-detail.scss',
  templateUrl: './recipe-detail.html',
})
export class RecipeDetail implements OnInit {
  private readonly api = inject(RecipeApi);

  /** Firebase key of the recipe, bound from the `:id` route parameter. */
  readonly id = input<string>('');
  /**
   * Ids of the result set the visitor came from, passed along by the results
   * page. Present means "came from the generator" — that is what the back
   * link points at, ahead of `cuisine`/`page` below.
   */
  readonly ids = input<string>('');
  /**
   * Cuisine key the visitor came from, passed along by a `/library/:cuisine`
   * row. Present (and `ids` absent) means "came from a cuisine page" — the
   * back link returns to that exact cuisine.
   */
  readonly cuisine = input<string>('');
  /** Page the visitor came from within that cuisine, passed along with `cuisine`. */
  readonly page = input<string>('');

  /** The loaded recipe, `null` while loading and when the id is unknown. */
  protected readonly recipe = signal<Recipe | null>(null);
  /** True until the request settled, so the page does not flash "not found". */
  protected readonly loading = signal(true);
  /** Like count shown next to the heart — starts at the loaded value, then tracks the pending/confirmed like. */
  protected readonly likeCount = signal(0);
  /** Whether this browser already gave (or just gave) this recipe its heart. */
  protected readonly isLiked = signal(false);

  /** Display data for `cuisine()`, or `undefined` when it is empty or not a known key. */
  private readonly cuisineInfo = computed(() => cuisineMeta(this.cuisine()));

  /**
   * Where the back link goes: the result set if we came from it, else the
   * cuisine page we came from, else the library overview.
   */
  protected readonly backLink = computed(() => {
    if (this.ids()) return '/generator/results';
    const meta = this.cuisineInfo();
    if (meta) return `/library/${meta.key}`;
    return '/library';
  });

  /** Label of the back link, matching its target. */
  protected readonly backLabel = computed(() => {
    if (this.ids()) return 'Recipe results';
    const meta = this.cuisineInfo();
    if (meta) return meta.label;
    return 'Cookbook';
  });

  /** Query parameters the back link needs to restore the result set or the cuisine page. */
  protected readonly backParams = computed<Record<string, string>>(() => {
    const ids = this.ids();
    if (ids) return { ids };

    const meta = this.cuisineInfo();
    const page = this.page();
    const params: Record<string, string> = {};
    if (meta && page) params['page'] = page;
    return params;
  });

  /** One entry per cook, used to render the chef badges in the header. */
  protected readonly chefs = computed(() => {
    const recipe = this.recipe();
    return recipe ? Array.from({ length: recipe.helpers }, (_, i) => i + 1) : [];
  });

  /**
   * Loads the recipe. Runs in `ngOnInit`, not in the constructor: the router
   * binds route inputs with `setInput` on the already-created component, so
   * `id()` still holds its default at construction time.
   */
  ngOnInit(): void {
    this.api.byId(this.id()).subscribe({
      next: (recipe) => {
        this.recipe.set(recipe);
        this.loading.set(false);
        if (recipe) {
          this.likeCount.set(recipe.likes);
          this.isLiked.set(hasLiked(recipe.id));
        }
      },
      error: () => this.loading.set(false),
    });
  }

  /**
   * The preferences the recipe was generated for, shown as pills next to the
   * nutrition table. "No preference" is left out — it says nothing.
   */
  protected tags(): string[] {
    const recipe = this.recipe();
    if (!recipe) return [];

    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const tags = [capitalize(recipe.cuisine), capitalize(recipe.timeCategory)];
    if (recipe.diet !== 'no-preference') tags.push(capitalize(recipe.diet));

    return tags;
  }

  /** Badge image for a cook; cooks beyond the four designed badges reuse the last one. */
  protected chefBadge(chef: number): string {
    return CHEF_BADGES[Math.min(chef, CHEF_BADGES.length) - 1];
  }

  /**
   * Fired once by `app-like-button` when a visitor gives this recipe a
   * heart. Shows the +1 and the liked state immediately (the button is
   * already disabled at that point), then persists it through `RecipeApi`.
   * A successful write remembers the id in `localStorage` so a reload keeps
   * the heart disabled; a failed write reverts both the count and the liked
   * state, since nothing was actually saved.
   */
  protected onLiked(): void {
    const recipe = this.recipe();
    if (!recipe) return;

    this.likeCount.update((count) => count + 1);
    this.isLiked.set(true);

    this.api.like(recipe.id).subscribe({
      next: (newCount) => {
        this.likeCount.set(newCount);
        markLiked(recipe.id);
      },
      error: () => {
        this.likeCount.update((count) => count - 1);
        this.isLiked.set(false);
      },
    });
  }

  /**
   * Whole-recipe amount for a per-portion nutrition value (User Story 10:
   * nutrition must be shown for the whole recipe), rounded to a whole
   * gram/kcal since the source value is itself only an estimate.
   */
  protected nutritionTotal(perPortion: number): number {
    const recipe = this.recipe();
    return recipe ? Math.round(perPortion * recipe.portions) : 0;
  }

  /**
   * Whether `recipe` has a stored `portionWeightG`, so nutrition can be
   * shown per 100g of the finished dish (decided 2026-09-28) instead of per
   * portion. Recipes generated before this field existed have none stored
   * in Firebase and fall back to the per-portion display.
   */
  protected hasPortionWeight(recipe: Recipe): boolean {
    return (
      typeof recipe.nutrition.portionWeightG === 'number' && recipe.nutrition.portionWeightG > 0
    );
  }

  /**
   * Calories per 100g of the finished dish, derived from the per-portion
   * value and `portionWeightG`. Only call once `hasPortionWeight` is true.
   * Rounded to a whole kcal since the source value is itself only an
   * estimate.
   */
  protected caloriesPer100(recipe: Recipe): number {
    return Math.round(
      (recipe.nutrition.caloriesPerPortion / recipe.nutrition.portionWeightG!) * 100,
    );
  }

  /**
   * A per-100g gram value (protein/carbs/fat), formatted the way the design
   * writes small amounts: whole grams, or one decimal place once the value
   * drops below 10g so it does not round away to "0g". Only call once
   * `hasPortionWeight` is true.
   */
  protected gramsPer100(perPortionG: number, recipe: Recipe): string {
    const value = (perPortionG / recipe.nutrition.portionWeightG!) * 100;
    return value < 10 ? value.toFixed(1) : String(Math.round(value));
  }

  /** Renders an amount the way the design writes it: "80g", "30ml", "1 piece". */
  protected amount(ingredient: RecipeIngredient): string {
    switch (ingredient.unit) {
      case 'gram':
        return `${ingredient.amount}g`;
      case 'ml':
        return `${ingredient.amount}ml`;
      default:
        return `${ingredient.amount} ${ingredient.amount === 1 ? 'piece' : 'pieces'}`;
    }
  }
}
